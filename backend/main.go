package main

import (
	"log"
	"net/http"
	"os"

	"./internal/handlers"
	"./internal/database"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../.env")
	database.Init()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/menu", handlers.Menu)
	mux.HandleFunc("/api/news", handlers.News)

	log.Printf("Server started at :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
