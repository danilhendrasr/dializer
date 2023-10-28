CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users(
    id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE workspace_visibility AS ENUM ('private', 'public');

CREATE TABLE IF NOT EXISTS workspaces(
    id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    visibility workspace_visibility NOT NULL DEFAULT 'private',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    owner_id uuid NOT NULL,
    CONSTRAINT fk_owner_id FOREIGN KEY(owner_id) REFERENCES users(id)
);

CREATE TYPE node_type AS ENUM (
    'start',
    'end',
    'input',
    'output',
    'process',
    'loop',
    'condition'
);

CREATE TABLE IF NOT EXISTS nodes(
    id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    type node_type NOT NULL,
    x INT NOT NULL,
    y INT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    content TEXT NOT NULL,
    next_node_id uuid NOT NULL,
    next_node_id_if_false uuid NOT NULL,
    CONSTRAINT fk_next_node_id FOREIGN KEY(next_node_id) REFERENCES nodes(id),
    CONSTRAINT fk_next_node_id_if_false FOREIGN KEY(next_node_id_if_false) REFERENCES nodes(id)
);

COMMENT ON COLUMN nodes.next_node_id_if_false IS 'Only used for branching-type nodes (loop and condition) to point to the next node if the condition is false';