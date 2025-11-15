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
	err := r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	priceStr := r.FormValue("price")
	caloriesStr := r.FormValue("calories")
	description := r.FormValue("description")
	category := r.FormValue("category")

	files := r.MultipartForm.File["images"]
	imagePaths, err := SaveUploadedFiles(files)
	if err != nil {
		http.Error(w, "Failed to save images: "+err.Error(), http.StatusBadRequest)
		return
	}

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		http.Error(w, "Invalid price", http.StatusBadRequest)
		return
	}

	calories, err := strconv.Atoi(caloriesStr)
	if err != nil {
		calories = 0
	}

	item := models.MenuItem{
		Title:       title,
		Price:       int(price),
		ImageURLs:   imagePaths,
		Calories:    calories,
		Description: description,
		Category:    category,
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

	// Get the menu item to delete associated images
	item, err := models.GetMenuItemByID(id)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch menu item", http.StatusInternalServerError)
		}
		return
	}

	// Delete associated images
	if err := DeleteUploadedFiles(item.ImageURLs); err != nil {
		http.Error(w, "Failed to delete images", http.StatusInternalServerError)
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

	err = r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	priceStr := r.FormValue("price")
	caloriesStr := r.FormValue("calories")
	description := r.FormValue("description")
	category := r.FormValue("category")

	files := r.MultipartForm.File["images"]
	imagePaths, err := SaveUploadedFiles(files)
	if err != nil {
		http.Error(w, "Failed to save images: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Preserve existing images
	existingImagesStr := r.FormValue("existingImages")
	var existingImages []string
	if existingImagesStr != "" {
		err = json.Unmarshal([]byte(existingImagesStr), &existingImages)
		if err != nil {
			http.Error(w, "Invalid existingImages", http.StatusBadRequest)
			return
		}
	}
	imagePaths = append(existingImages, imagePaths...)

	// Get current item to delete removed images
	currentItem, err := models.GetMenuItemByID(id)
	if err != nil {
		if errors.Is(err, models.ErrMenuItemNotFound) {
			http.Error(w, "Menu item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch menu item", http.StatusInternalServerError)
		}
		return
	}

	// Find images to delete (those in current but not in new list)
	var imagesToDelete []string
	for _, currentURL := range currentItem.ImageURLs {
		found := false
		for _, newURL := range imagePaths {
			if currentURL == newURL {
				found = true
				break
			}
		}
		if !found {
			imagesToDelete = append(imagesToDelete, currentURL)
		}
	}

	// Delete removed images
	if err := DeleteUploadedFiles(imagesToDelete); err != nil {
		http.Error(w, "Failed to delete old images", http.StatusInternalServerError)
		return
	}

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		http.Error(w, "Invalid price", http.StatusBadRequest)
		return
	}

	calories, err := strconv.Atoi(caloriesStr)
	if err != nil {
		calories = 0
	}

	item := models.MenuItem{
		Title:       title,
		Price:       int(price),
		ImageURLs:   imagePaths,
		Calories:    calories,
		Description: description,
		Category:    category,
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
