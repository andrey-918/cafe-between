package handlers

import (
	"time"

	"github.com/patrickmn/go-cache"
)

var Cache = cache.New(7*24*time.Hour, 10*time.Minute)
