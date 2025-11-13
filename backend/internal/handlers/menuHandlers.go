package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/andrey-918/cafe-between/models"
	"github.com/gorilla/mux"
)


func CreateMenuItemHandler(w http.ResponseWriter, r *http.Request) {
	var item models.MenuItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	id, err := models.CreateMenuItem(item)
	if err != nil {
		http.Error(w, "Failed to create menu item", http.StatusInternalServerError)
		return
	}
	createdMenuItem, err := models.GetMenuItemByID(id)
	if err != nil { 
		http.Error(w, "Failed to fetch created menu item", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdMenuItem)
}

func GetMenuHandler(w http.ResponseWriter, r *http.Request) {
	menu, err := models.GetMenu()
	if err != nil {
		http.Error(w, "Failed to fetch menu", http.StatusInternalServerError)
		return 
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(menu)
}

func GetMenuItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	item, err := models.GetMenuItemByID(id)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch menu item", http.StatusInternalServerError)
		}
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func DelMenuItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	err = models.DelMenuItem(id)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to delete menu item", http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UpdateMenuHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var item models.MenuItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	err = models.UpdateMenuItem(id, item)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to update menu item", http.StatusInternalServerError)
		}
		return
	}
	w.WriteHeader(http.StatusNoContent)
}