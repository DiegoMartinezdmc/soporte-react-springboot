const slug = texto => texto.toLowerCase().replace(/\s+/g, '-')

export default function SolicitudCard({ titulo, prioridad, estado, onResolver }) {
  const resuelta = estado === 'Resuelta'
  return (
    <article className="solicitud">
      <div className="solicitud-main">
        <h3>{titulo}</h3>
        <div className="badges">
          <span className={`badge b-${slug(prioridad)}`}>
            <span className="sr-only">Prioridad: </span>{prioridad}
          </span>
          <span className={`badge s-${slug(estado)}`}>
            <span className="sr-only">Estado: </span>{estado}
          </span>
        </div>
      </div>
      <button type="button" className="btn btn-ghost"
        onClick={onResolver} disabled={resuelta}>
        {resuelta ? 'Resuelta' : 'Resolver'}
        <span aria-hidden="true">→</span>
      </button>
    </article>
  )
}
