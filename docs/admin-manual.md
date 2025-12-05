# Manual de Administrador

## Conversión de Usuarios a Socios

- Ingresar al panel: ruta `/mahalo-panel-de-administracion`.
- Abrir sección `Socios`.
- En `Usuarios sin membresía`, seleccionar un usuario.
- En la tarjeta de configuración:
  - Introducir un número de socio o usar `Generar aleatorio`.
  - Ajustar `Dígitos` entre 4 y 10 según necesidad.
  - Presionar `Guardar y convertir en socio`.
- Validaciones:
  - El número debe ser solo dígitos y tener entre 4 y 10 caracteres.
  - El sistema verifica unicidad en la base de datos y rechaza duplicados.

## Actualización de Número de Socio

- En `Socios activos`, seleccionar el usuario.
- Editar el número de socio.
- Presionar `Actualizar número de socio`.
- Se aplican las mismas validaciones y verificación de unicidad.

## Generador de Números de Socio

- Botón `Generar aleatorio` en la tarjeta de configuración.
- Control `Dígitos` para definir longitud entre 4 y 10.
- El servidor genera un número único; si no es posible, se muestra un mensaje para verificar al guardar.

## Permisos y Seguridad

- El panel requiere usuario con `is_admin = 1`.
- El backend valida duplicados y formato del número.
- Los endpoints administrativos no incluyen JWT; el acceso se controla desde la aplicación.

## Endpoints relacionados

- `GET /api/users`: lista de usuarios.
- `PUT /api/admin/users/:id/membership`: asigna/actualiza número de socio.
- `POST /api/admin/membership/generate`: genera número único con `{ digits }`.

## Mensajes de error comunes

- `Usuario no encontrado`: el ID no existe.
- `Número de socio duplicado`: el número ya está asignado a otro usuario.
- `El número de socio debe tener entre 4 y 10 dígitos`: longitud inválida.
- `El número de socio debe ser numérico`: contiene caracteres no permitidos.
