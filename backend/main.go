package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/andrey-918/cafe-between/internal/database"
	"github.com/andrey-918/cafe-between/internal/handlers"
	"github.com/patrickmn/go-cache"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../.env")
	database.Init()

	// Initialize cache with default expiration of 7 days and cleanup interval of 10 minutes
	handlers.Cache = cache.New(7*24*time.Hour, 10*time.Minute)

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
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

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

	r.HandleFunc("/api/menu-categories", handlers.GetMenuCategoriesHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/menu-categories/{id}/sort-order", handlers.UpdateMenuCategorySortOrderHandler).Methods("PUT", "OPTIONS")

	r.HandleFunc("/api/news", handlers.GetNewsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/news", handlers.CreateNewsHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/news/{id}", handlers.GetNewsByIdHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/news/{id}", handlers.DelNewsHandler).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/api/news/{id}", handlers.UpdateNewsHandler).Methods("PUT", "OPTIONS")

	r.HandleFunc("/api/login", handlers.LoginHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/logout", handlers.LogoutHandler).Methods("POST", "OPTIONS")

	// Serve static files from uploads directory
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("/root/uploads/"))))

	adminRouter := r.PathPrefix("/api/admin").Subrouter()
	adminRouter.Use(handlers.JWTMiddleware)
	adminRouter.HandleFunc("/menu", handlers.GetMenuHandler).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/menu", handlers.CreateMenuItemHandler).Methods("POST", "OPTIONS")
	adminRouter.HandleFunc("/menu/{id}", handlers.UpdateMenuHandler).Methods("PUT", "OPTIONS")
	adminRouter.HandleFunc("/menu/{id}", handlers.DelMenuItemHandler).Methods("DELETE", "OPTIONS")

	adminRouter.HandleFunc("/news", handlers.GetNewsHandler).Methods("GET", "OPTIONS")
	adminRouter.HandleFunc("/news", handlers.CreateNewsHandler).Methods("POST", "OPTIONS")
	adminRouter.HandleFunc("/news/{id}", handlers.UpdateNewsHandler).Methods("PUT", "OPTIONS")
	adminRouter.HandleFunc("/news/{id}", handlers.DelNewsHandler).Methods("DELETE", "OPTIONS")

	log.Printf("Server started at :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Connection failed: %v", err)
	}
}
