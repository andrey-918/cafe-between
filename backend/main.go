package main

import (
	"log"
	"net/http"
	"os"

	"github.com/andrey-918/cafe-between/internal/database"
	"github.com/andrey-918/cafe-between/internal/handlers"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../.env")
	database.Init()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r := mux.NewRouter()

	// CORS middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	r.HandleFunc("/api/menu", handlers.GetMenuHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/menu", handlers.CreateMenuItemHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/menu/{id}", handlers.GetMenuItemHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/menu/{id}", handlers.DelMenuItemHandler).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/api/menu/{id}", handlers.UpdateMenuHandler).Methods("PUT", "OPTIONS")
	

	r.HandleFunc("/api/news", handlers.GetNewsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/news", handlers.CreateNewsHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/news/{id}", handlers.GetNewsByIdHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/news/{id}", handlers.DelNewsHandler).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/api/news/{id}", handlers.UpdateNewsHandler).Methods("PUT", "OPTIONS")
	
	

	log.Printf("Server started at :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Connection failed: %v", err)
	}
}
