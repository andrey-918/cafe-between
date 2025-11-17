package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/andrey-918/cafe-between/models"
	"github.com/gorilla/mux"
)

func GetMenuCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	categories, err := models.GetMenuCategories()
	if err != nil {
		http.Error(w, "Failed to fetch menu categories", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func UpdateMenuCategorySortOrderHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req struct {
		SortOrder int `json:"sort_order"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = models.UpdateMenuCategorySortOrder(id, req.SortOrder)
	if err != nil {
		http.Error(w, "Failed to update sort order", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
