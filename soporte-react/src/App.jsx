import { useEffect, useRef, useState } from 'react'
import { api } from './services/api'
import SolicitudCard from './components/SolicitudCard'
import './App.css'

function App() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todas')
  const [filtroEstado, setFiltroEstado] = useState('Todas')

  const [titulo, setTitulo] = useState('')
  const [prioridad, setPrioridad] = useState('Media')
  const [enviando, setEnviando] = useState(false)
  const [errorAlta, setErrorAlta] = useState('')
  const [exito, setExito] = useState('')
  // bloqueo síncrono: evita el doble click antes de que React re-renderice
  const enviandoRef = useRef(false)
  const controladorRef = useRef(null)

  async function recargar() {
    controladorRef.current?.abort()
    const controller = new AbortController()
    controladorRef.current = controller

    try {
      setCargando(true)
      setError('')
      const respuesta = await api.get('/solicitudes', {
        signal: controller.signal
      })
      if (controller.signal.aborted) return
      setSolicitudes(respuesta.data)
      setCargando(false)
    } catch (err) {
      if (err.code !== 'ERR_CANCELED') {
        setError('No fue posible consultar las solicitudes.')
        setCargando(false)
      }
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- sincroniza con una API externa
    recargar()
    return () => controladorRef.current?.abort()
  }, [])

  function validar() {
    const texto = titulo.trim()
    if (!texto) return 'Escribe una descripción de la solicitud.'
    if (texto.length < 5) return 'La descripción debe tener al menos 5 caracteres.'
    if (texto.length > 200) return 'La descripción no puede superar los 200 caracteres.'
    if (!['Alta', 'Media', 'Baja'].includes(prioridad)) return 'Prioridad no válida.'
    return ''
  }

  async function enviar(e) {
    e.preventDefault()
    if (enviandoRef.current) return // ya hay una petición en vuelo

    const problema = validar()
    if (problema) {
      setErrorAlta(problema)
      return
    }
    setErrorAlta('')
    setExito('')
    enviandoRef.current = true
    setEnviando(true)

    try {
      const respuesta = await api.post('/solicitudes', {
        titulo: titulo.trim(),
        prioridad
      })

      // solo aquí el servidor confirmó: recién entonces entra a la lista
      if (respuesta.data?.id) {
        setSolicitudes(actuales => [...actuales, respuesta.data])
      } else {
        await recargar() // 201 sin cuerpo: reconsulta la fuente de verdad
      }
      setTitulo('')
      setPrioridad('Media')
      setExito('Solicitud registrada.')
    } catch (err) {
      const status = err.response?.status
      if (status === 400) {
        setErrorAlta(err.response?.data?.mensaje ?? 'Datos inválidos (400).')
      } else if (status === 409) {
        setErrorAlta('Esa solicitud ya fue registrada (409).')
        await recargar() // re-sincroniza con lo que el servidor sí guardó
      } else if (status === 401 || status === 403) {
        setErrorAlta('No tienes permiso para registrar solicitudes.')
      } else if (status >= 500) {
        setErrorAlta('El servidor falló (5xx). Intenta nuevamente.')
      } else {
        setErrorAlta('Sin respuesta del servidor. Revisa tu conexión.')
      }
      // la lista NO se modifica en ningún caso de error
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  function resolver(id) {
    setSolicitudes(actuales =>
      actuales.map(s => s.id === id ? { ...s, estado: 'Resuelta' } : s)
    )
  }

  const total = solicitudes.length
  const pendientes = solicitudes.filter(s => s.estado === 'Pendiente').length
  const enProceso = solicitudes.filter(s => s.estado === 'En proceso').length
  const resueltas = solicitudes.filter(s => s.estado === 'Resuelta').length
  const porcentajeResueltas = total === 0 ? 0
    : Math.round((resueltas / total) * 100)

  const visibles = solicitudes.filter(s =>
    (filtroPrioridad === 'Todas' || s.prioridad === filtroPrioridad) &&
    (filtroEstado === 'Todas' || s.estado === filtroEstado)
  )

  return (
    <main className="app">
      <header className="page-header">
        <p className="overline">Mesa de ayuda — API Spring Boot</p>
        <h1>Gestión de solicitudes</h1>
        <p className="sub">Registra, filtra y resuelve tus tickets en un solo lugar.</p>
      </header>

      {!cargando && !error && total > 0 &&
        <section className="stats" aria-label="Resumen de solicitudes">
          <div className="stat">
            <span className="stat-n">{total}</span>
            <span className="stat-l">Total</span>
          </div>
          <div className="stat">
            <span className="stat-n">{pendientes}</span>
            <span className="stat-l">Pendientes</span>
          </div>
          <div className="stat">
            <span className="stat-n">{enProceso}</span>
            <span className="stat-l">En proceso</span>
          </div>
          <div className="stat">
            <span className="stat-n">{resueltas}</span>
            <span className="stat-l">Resueltas</span>
          </div>
          <div className="progress" aria-hidden="true">
            <span style={{ width: `${porcentajeResueltas}%` }} />
          </div>
          <p className="progress-label">
            {porcentajeResueltas}% de las solicitudes están resueltas
          </p>
        </section>}

      <section className="card">
        <p className="overline">Nueva solicitud</p>
        <form onSubmit={enviar} noValidate>
          <div className="field">
            <label htmlFor="titulo">Descripción</label>
            <input id="titulo" type="text" value={titulo} maxLength={200}
              placeholder="Ej: el equipo no enciende"
              aria-invalid={Boolean(errorAlta)}
              onChange={e => setTitulo(e.target.value)} />
          </div>
          <fieldset className="field">
            <legend>Prioridad</legend>
            <div className="segmented">
              {['Alta', 'Media', 'Baja'].map(op => (
                <label key={op}>
                  <input type="radio" name="prioridad" value={op}
                    checked={prioridad === op}
                    onChange={() => setPrioridad(op)} />
                  <span className="segment">{op}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="form-actions">
            <button type="submit" className="btn" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Registrar'}
              <span aria-hidden="true">→</span>
            </button>
            <p className="hint">
              Se guarda en el servidor solo cuando la API confirma el registro.
            </p>
          </div>
        </form>
        {errorAlta && <p className="msg msg-error" role="alert">{errorAlta}</p>}
        {exito && <p className="msg msg-ok" role="status">{exito}</p>}
      </section>

      <section className="toolbar" aria-label="Filtros">
        <div className="toolbar-group">
          <label htmlFor="prioridad-filtro">Prioridad</label>
          <select id="prioridad-filtro" value={filtroPrioridad}
            onChange={e => setFiltroPrioridad(e.target.value)}>
            <option>Todas</option>
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
        </div>
        <div className="toolbar-group">
          <label htmlFor="estado">Estado</label>
          <select id="estado" value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}>
            <option>Todas</option>
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Resuelta</option>
          </select>
        </div>
        {total > 0 && <p className="count">{visibles.length} de {total}</p>}
      </section>

      {cargando && <p className="state" role="status">Cargando solicitudes…</p>}
      {error && <p className="state state-error" role="alert">{error}</p>}
      {!cargando && !error && total === 0 &&
        <p className="state">Aún no hay solicitudes registradas.</p>}
      {!cargando && !error && total > 0 && visibles.length === 0 &&
        <p className="state" role="status">
          No hay solicitudes que coincidan con los filtros.
        </p>}
      {!cargando && !error && visibles.length > 0 &&
        <div className="list">
          {visibles.map(s =>
            <SolicitudCard key={s.id} {...s}
              onResolver={() => resolver(s.id)} />
          )}
        </div>}
    </main>
  )
}

export default App