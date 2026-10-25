# Reflexión: aplicación de soporte

## 1. ¿Qué diferencia existe entre componente, prop y estado?

Un **componente** es una pieza reutilizable de la interfaz, por ejemplo una
tabla de solicitudes o un formulario. Las **props** son datos que un componente
padre entrega a un componente hijo y no deben ser modificadas por el hijo. El
**estado** es información que pertenece al componente y puede cambiar con la
interacción del usuario o una respuesta del servidor; al cambiar, React vuelve
a renderizar la vista necesaria.

## 2. ¿Por qué `useEffect` es adecuado para iniciar una consulta externa?

`useEffect` permite ejecutar efectos secundarios después de que React renderiza
el componente. Una consulta HTTP es un efecto secundario porque depende de un
servicio externo y es asíncrona. Usarlo con un arreglo de dependencias adecuado
evita repetir consultas innecesarias y permite guardar la respuesta, el estado
de carga o los errores en el estado del componente.

## 3. ¿Qué responsabilidades corresponden a React y cuáles a Spring Boot?

React se encarga de presentar la interfaz, capturar acciones del usuario y
consumir la API. Spring Boot expone la API REST, aplica las reglas de negocio y
administra los datos de las solicitudes. En este proyecto, React consume
`/api/solicitudes` y Spring Boot responde a esas operaciones mediante el
controlador y el servicio correspondientes.

## 4. ¿Cómo distinguirías un error de CORS, un 404 y una caída del servidor?

- **CORS:** el navegador bloquea la solicitud por no permitir el origen de la
  aplicación web. Usualmente aparece un mensaje de política CORS en la consola,
  aun cuando la API esté disponible.
- **404:** el servidor respondió, pero la ruta o el recurso solicitado no
  existe. Se verifica la URL, el método HTTP y el identificador enviado.
- **Caída del servidor:** no se puede establecer conexión o se recibe un error
  5xx. Se debe confirmar que Spring Boot esté ejecutándose y revisar sus logs.

## 5. ¿Qué mejorarías antes de publicar el sistema para usuarios reales?

Agregaría autenticación y autorización, una base de datos persistente, validación
más completa de entradas y manejo de errores visible para el usuario. También
configuraría CORS mediante variables de entorno para el dominio de producción,
incorporaría pruebas de integración y de interfaz, registros centralizados,
HTTPS, copias de seguridad y un proceso de despliegue automatizado.
