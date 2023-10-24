use axum::{routing::get, Router};
use sqlx::postgres::PgPool;

mod healthcheck;
mod types;

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
        .with_state(db_pool);

    axum::Server::bind(&"0.0.0.0:3005".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
