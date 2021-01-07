package main

import (
	"log"
	"os"

	"github.com/marksin/ffmpeg/encode"
	"github.com/marksin/ffmpeg/parameter"
)

func main() {
	p, err := parameter.HandleParameter(os.Args)
	log.Println(p)
	if err != nil {
		log.Fatal(err)
	}
	if err = encode.DispatchJob(p); err != nil {
		log.Fatal(err)
	}
}
