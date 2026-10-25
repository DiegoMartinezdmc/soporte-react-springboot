package com.example.soporte.Services;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

import com.example.soporte.Models.Solicitud;

/**
 * Almacenamiento temporal en memoria. Los datos se pierden al reiniciar la
 * aplicación.
 */
@Service
public class SolicitudService {

    private final Map<Long, Solicitud> solicitudes = new ConcurrentHashMap<>();
    private final AtomicLong secuencia = new AtomicLong(0);

    public SolicitudService() {
        crear(new Solicitud(null, "Equipo no enciende", "Alta", "Pendiente"));
        crear(new Solicitud(null, "Instalar software", "Media", "En proceso"));
    }

    public List<Solicitud> listar() {
        return solicitudes.values().stream()
                .sorted(Comparator.comparing(Solicitud::id))
                .toList();
    }

    public Optional<Solicitud> buscarPorId(Long id) {
        return Optional.ofNullable(solicitudes.get(id));
    }

    public Solicitud crear(Solicitud solicitud) {
        Solicitud normalizada = normalizar(solicitud);
        long id = secuencia.incrementAndGet();
        Solicitud guardada = new Solicitud(id, normalizada.titulo(),
                normalizada.prioridad(), normalizada.estado());
        solicitudes.put(id, guardada);
        return guardada;
    }

    public Optional<Solicitud> eliminar(Long id) {
        return Optional.ofNullable(solicitudes.remove(id));
    }

    private Solicitud normalizar(Solicitud solicitud) {
        String prioridad = (solicitud.prioridad() == null || solicitud.prioridad().isBlank())
                ? "Media"
                : solicitud.prioridad().trim();
        String estado = (solicitud.estado() == null || solicitud.estado().isBlank())
                ? "Pendiente"
                : solicitud.estado().trim();
        String titulo = solicitud.titulo() == null ? null : solicitud.titulo().trim();
        return new Solicitud(solicitud.id(), titulo, prioridad, estado);
    }
}
