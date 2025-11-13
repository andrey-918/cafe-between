package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/andrey-918/cafe-between/models"
	"github.com/gorilla/mux"
)


func CreateNewsHandler(w http.ResponseWriter, r *http.Request) {
	var item models.News
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	id, err := models.CreateNews(item)
	if err != nil {
		http.Error(w, "Failed to create News item", http.StatusInternalServerError)
		return
	}
	createdNews, err := models.GetNewsByID(id)
	if err != nil { 
		http.Error(w, "Failed to fetch created News item", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdNews)
}

func GetNewsHandler(w http.ResponseWriter, r *http.Request) {
	news, err := models.GetNews()
	if err != nil {
		http.Error(w, "Failed to fetch news", http.StatusInternalServerError)
		return 
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(news)
}

func GetNewsByIdHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	item, err := models.GetNewsByID(id)
	if err != nil {
		if errors.Is(err, models.ErrNewsNotFound) {
			http.Error(w, "News item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch News item", http.StatusInternalServerError)
		}
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func DelNewsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	err = models.DelNews(id)
	if err != nil {
		if errors.Is(err, models.ErrNewsNotFound) {
			http.Error(w, "News not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to delete news", http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UpdateNewsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var item models.News
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	err = models.UpdateNews(id, item)
	if err != nil {
		if errors.Is(err, models.ErrNewsNotFound) {
			http.Error(w, "News not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to update news", http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusNoContent)
}