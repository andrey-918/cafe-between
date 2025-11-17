package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../.env")
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		log.Fatal("POSTGRES_DSN not set in .env")
	}

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	_, err = pool.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS menu_categories (
			id SERIAL PRIMARY KEY,
			name_ru VARCHAR(255) NOT NULL UNIQUE,
			name_en VARCHAR(255) NOT NULL UNIQUE,
			sort_order INTEGER DEFAULT 0,
			createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}

	// Add sort_order column if it doesn't exist
	_, err = pool.Exec(context.Background(), `
		ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
	`)
	if err != nil {
		log.Fatalf("Failed to add sort_order column: %v", err)
	}

	log.Println("Migration completed")
}
