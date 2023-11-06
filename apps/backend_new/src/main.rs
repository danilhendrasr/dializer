use axum::{
    routing::{get, post},
    Router,
};
use sqlx::postgres::PgPool;

mod auth;
mod healthcheck;
mod types;
mod users;
mod workspaces;

#[tokio::main]
async fn main() {
    let db_pool =
        match PgPool::connect("postgres://postgres:dializer@localhost:5432/postgres").await {
            Ok(connection) => connection,
            Err(e) => panic!("{}", e.to_string()),
        };

    let app = Router::new()
        .route("/", get(|| async { "Hello world!" }))
        .route("/health", get(healthcheck::get_health))
        .route("/users/:user_id", get(users::get_user_by_id))
        .route(
            "/users/:user_id/workspaces",
            get(users::get_user_workspaces),
        )
        .route("/workspaces", post(workspaces::create_workspace))
        .route(
            "/workspaces/:workspace_id",
            get(workspaces::get_workspace_by_id)
                .put(workspaces::update_workspace_by_id)
                .delete(workspaces::delete_workspace_by_id),
        )
        .route(
            "/workspaces/:workspace_id/nodes",
            get(workspaces::get_workspace_nodes),
        )
        .route("/auth/login", post(auth::login))
        .route("/auth/register", post(auth::register))
        .with_state(db_pool);

    axum::Server::bind(&"0.0.0.0:3005".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
