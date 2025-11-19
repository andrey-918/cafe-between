package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/andrey-918/cafe-between/models"
	"github.com/gorilla/mux"
	"github.com/patrickmn/go-cache"
)

func GetMenuCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	if cached, found := Cache.Get("menu_categories"); found {
		categories := cached.([]models.MenuCategory)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(categories)
		return
	}
	categories, err := models.GetMenuCategories()
	if err != nil {
		http.Error(w, "Failed to fetch menu categories", http.StatusInternalServerError)
		return
	}
	Cache.Set("menu_categories", categories, cache.DefaultExpiration)
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

	Cache.Delete("menu_categories")
	Cache.Delete("menu")
	w.WriteHeader(http.StatusNoContent)
}

func DeleteMenuCategoryHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Get the category
	category, err := models.GetMenuCategoryByID(id)
	if err != nil {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	// Check if used
	items, err := models.GetMenuItemsByCategory(category.NameEn)
	if err != nil {
		http.Error(w, "Failed to check category usage", http.StatusInternalServerError)
		return
	}
	if len(items) > 0 {
		// Return 409 with list of items
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "Category is in use",
			"items": items,
		})
		return
	}

	// Delete the category
	err = models.DeleteMenuCategoryByID(id)
	if err != nil {
		http.Error(w, "Failed to delete category", http.StatusInternalServerError)
		return
	}

	Cache.Delete("menu_categories")
	Cache.Delete("menu")
	w.WriteHeader(http.StatusNoContent)
}
