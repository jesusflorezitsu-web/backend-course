# Casos adversariales — Request API v5

Describe al menos OCHO ataques que tu implementación deberá resistir. Formato
de cada caso: qué envía el atacante → respuesta exacta (código HTTP +
`error.code`). Ejemplo resuelto:

Ejemplo → GET /requests sin header Authorization → 401 AUTHENTICATION_REQUIRED.
El middleware corta antes de que el router se entere.

Piensa como quien NO respeta tu frontend: registro con `role`, `createdBy`
inventado, IDs ajenos, tokens editados o vencidos, bodies mixtos, headers raros…

1.
2.
3.
4.
5.
6.
7.
8.
