package encode

import (
	"fmt"
	"strings"
	"sync"

	"github.com/marksin/ffmpeg/mongodb"
	"github.com/marksin/ffmpeg/parameter"
)

//DispatchJob to goroutine Start() for every jobID
func DispatchJob(p parameter.Arguments) error {
	var wg sync.WaitGroup
	db, err := mongodb.Initialization(p.URL)
	if err != nil {
		return err
	}
	connection := mongodb.MongoClient{C: db}
	jobList, err := connection.Query(p.JobID)
	if err != nil {
		return err
	}
	for i := 0; i < len(jobList); i++ {
		switch jobList[i].Status {
		case "pending":
			wg.Add(1)
			go Start(&wg, jobList[i], &connection)
			if p.IsOnebyOne {
				wg.Wait()
			}
		case "":
			fmt.Println("Empty job status. Probably Wrong ID or failing to connect to Mongodb")

		default:
			output := strings.Split(jobList[i].Parameters.Output, "/")
			file := output[len(output)-1]
			fmt.Printf("Job for output file %s is skipped because its job status is \"%s\" \n", strings.Title(file), jobList[i].Status)
		}
	}

	wg.Wait()

	return nil

}
