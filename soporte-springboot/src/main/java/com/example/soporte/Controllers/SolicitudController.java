package com.example.soporte.Controllers;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.soporte.Models.Solicitud;
import com.example.soporte.Services.SolicitudService;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "http://localhost:5173")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    public List<Solicitud> listar() {
        return solicitudService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> obtener(@PathVariable Long id) {
        return solicitudService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Solicitud solicitud) {
        if (solicitud.titulo() == null || solicitud.titulo().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El título es obligatorio"));
        }
        Solicitud creada = solicitudService.crear(solicitud);
        URI ubicacion = URI.create("/api/solicitudes/" + creada.id());
        return ResponseEntity.created(ubicacion).body(creada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Solicitud> eliminar(@PathVariable Long id) {
        return solicitudService.eliminar(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
