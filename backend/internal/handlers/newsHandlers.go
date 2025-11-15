package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/andrey-918/cafe-between/models"
	"github.com/gorilla/mux"
)

func CreateNewsHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	preview := r.FormValue("preview")
	description := r.FormValue("description")
	postedAtStr := r.FormValue("postedAt")

	files := r.MultipartForm.File["images"]
	imagePaths, err := SaveUploadedFiles(files)
	if err != nil {
		http.Error(w, "Failed to save images: "+err.Error(), http.StatusBadRequest)
		return
	}

	postedAt, err := time.Parse(time.RFC3339, postedAtStr)
	if err != nil {
		http.Error(w, "Invalid postedAt format", http.StatusBadRequest)
		return
	}

	item := models.News{
		Title:       title,
		Preview:     preview,
		Description: description,
		ImageURLs:   imagePaths,
		PostedAt:    postedAt,
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

	// Get the news item to delete associated images
	item, err := models.GetNewsByID(id)
	if err != nil {
		if errors.Is(err, models.ErrNewsNotFound) {
			http.Error(w, "News not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch news item", http.StatusInternalServerError)
		}
		return
	}

	// Delete associated images
	if err := DeleteUploadedFiles(item.ImageURLs); err != nil {
		http.Error(w, "Failed to delete images", http.StatusInternalServerError)
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

	err = r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	preview := r.FormValue("preview")
	description := r.FormValue("description")
	postedAtStr := r.FormValue("postedAt")

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
	currentItem, err := models.GetNewsByID(id)
	if err != nil {
		if errors.Is(err, models.ErrNewsNotFound) {
			http.Error(w, "News not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch news item", http.StatusInternalServerError)
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

	postedAt, err := time.Parse(time.RFC3339, postedAtStr)
	if err != nil {
		http.Error(w, "Invalid postedAt format", http.StatusBadRequest)
		return
	}

	item := models.News{
		Title:       title,
		Preview:     preview,
		Description: description,
		ImageURLs:   imagePaths,
		PostedAt:    postedAt,
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
