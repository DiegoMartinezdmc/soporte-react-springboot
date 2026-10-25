package com.example.soporte.Controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.example.soporte.Services.SolicitudService;

@SpringBootTest
@AutoConfigureMockMvc
class SolicitudControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SolicitudService solicitudService;

    @Test
    void crearSolicitudLaGuardaEnMemoria() throws Exception {
        MvcResult resultado = mockMvc.perform(post("/api/solicitudes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Monitor dañado\",\"prioridad\":\"Alta\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", startsWith("/api/solicitudes/")))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.prioridad").value("Alta"))
                .andExpect(jsonPath("$.estado").value("Pendiente"))
                .andReturn();

        long id = leerId(resultado);
        assertThat(solicitudService.buscarPorId(id)).isPresent();

        mockMvc.perform(get("/api/solicitudes/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Monitor dañado"));
    }

    @Test
    void crearSinTituloDevuelveBadRequest() throws Exception {
        mockMvc.perform(post("/api/solicitudes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prioridad\":\"Baja\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").isNotEmpty());
    }

    @Test
    void obtenerSolicitudInexistenteDevuelveNotFound() throws Exception {
        mockMvc.perform(get("/api/solicitudes/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarSolicitudLaQuitaDeMemoria() throws Exception {
        MvcResult resultado = mockMvc.perform(post("/api/solicitudes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Prueba temporal\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        long id = leerId(resultado);

        mockMvc.perform(delete("/api/solicitudes/" + id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/solicitudes/" + id))
                .andExpect(status().isNotFound());
    }

    private long leerId(MvcResult resultado) throws Exception {
        Object id = JsonPath.read(resultado.getResponse().getContentAsString(), "$.id");
        return ((Number) id).longValue();
    }
}
