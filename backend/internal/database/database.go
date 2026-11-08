package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var Pool *pgxpool.Pool

func Init() {
	_ = godotenv.Load("../.env")
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		log.Fatal("POSTGRES_DSN not set in .env")
	}

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("Unable to parse database connection string: %v", err)
	}
	if host := os.Getenv("POSTGRES_HOST"); host != "" {
		config.ConnConfig.Host = host
		if password := os.Getenv("POSTGRES_PASSWORD"); password != "" {
			config.ConnConfig.Password = password
		}
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to ping database: %v", err)
	}
	Pool = pool
	log.Println("Connected to PostgreSQL")
}
