-- 002 · Status history table — GUIDED: complete the TODOs before running.
-- Your transition-map.md and resource-model.md already contain every answer.
-- Run after 001 (the foreign key needs requests to exist).

CREATE TABLE request_status_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Todo cambio de estado pertenece a una solicitud concreta. Sin ella el
  -- evento no tendría a quién contar historia.
  request_id BIGINT NOT NULL,

  -- previous_status ACEPTA NULL: la primera entrada de la historia es el
  -- "nacimiento" de la solicitud (status open). Antes del nacimiento no
  -- existe un estado anterior, y NULL es la única forma honesta de decirlo.
  previous_status VARCHAR(30),

  -- new_status NO puede ser NULL: cada evento tiene un destino obligatorio;
  -- una transición sin estado al que llegar no es una transición.
  new_status VARCHAR(30) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT request_status_history_request_fk
    FOREIGN KEY (request_id)
    REFERENCES requests(id),

  -- previous_status: NULL (nacimiento) O uno de los cinco estados conocidos.
  CONSTRAINT request_status_history_previous_check
    CHECK (
      previous_status IS NULL OR
      previous_status IN ('open', 'in_progress', 'resolved', 'closed', 'cancelled')
    ),

  -- new_status: siempre uno de los cinco estados conocidos.
  CONSTRAINT request_status_history_new_check
    CHECK (
      new_status IN ('open', 'in_progress', 'resolved', 'closed', 'cancelled')
    )
);

-- El historial crece linealmente por transición; el endpoint
-- GET /requests/:id/history filtra por request_id, así que indexamos esa
-- columna para evitar un seq scan a medida que la tabla escala.
CREATE INDEX request_status_history_request_id_idx
  ON request_status_history(request_id);