package encode

import (
	"log"
	"sync"
	"time"

	"github.com/marksin/ffmpeg/mongodb"
)

// Start Retrieve parameters from mongodb and pass them to goroutine Encode()
func Start(Parentwg *sync.WaitGroup, job mongodb.Job, c *mongodb.MongoClient) {
	update := updateStatusClosure(job.ID, c)
	ch := Channels{Transmit: make(chan Message, 2), Receive: make(chan Message, 2), EmergencyMsg: make(chan Message, 2)}
	//Parse Arugements retrived from Mongodb as []string
	p := parseArg(job.Parameters)
	//Check if arguments contain any illegal characters
	if err := ArgChecker(p); err != nil {
		log.Println(err)
		if err := update("Error"); err != nil {
			log.Println(err)
		}
		log.Fatal("Terminate process to prevent remote execution")
	}
	//Start Encoding
	go Encode(ch, p)
	//Spawn additional goroutine to handle emergency message
	go func() {
		r := <-ch.EmergencyMsg
		if r.Terminated {
			update("Terminated Successfully")
		} else {
			update("Failed to terminate")
		}
		Parentwg.Done()
	}()
	//    Update status to "started"
	if err := update("started"); err != nil {
		log.Println(err)
		log.Println("Failed to update job status to Started. Terminating...")
		Parentwg.Done()
	}

	for {
		//signal goroutine to stop if job status change to "Terminate"
		result, err := c.Query([]string{job.ID})
		if err != nil {
			log.Fatal(err)
		} else {
			switch result[0].Status {
			//Job status changed to "terminate"
			case "terminate":
				ch.Transmit <- Message{shouldTerminate: true, Terminated: false}
				//Goroutine should have handled the emergency message before sleep completes
				time.Sleep(time.Second * 2)
				if err := update("TimeOut. Failed to Terminate"); err != nil {
					log.Println(err)
				}
				Parentwg.Done()
			}
		}
		//Listen from goroutine
		select {
		case receiver := <-ch.Receive:
			//if the goroutine is terminated
			if receiver.Terminated {

				if receiver.Error != nil {
					if err := update("Error"); err != nil {
						log.Println(err)
					}
					log.Printf("Job %s has encountered errors. Please check log file at %s for more details", job.ID, receiver.Error)
				} else {
					if err := update("finished"); err != nil {
						log.Println(err)
					}
				}
				Parentwg.Done()
			}
			if receiver.isUpdate {
				progress := float64(receiver.progress) / float64(result[0].Length)
				progress = progress * 100
				p := int(progress)
				if p > 100 {
					p = 100
				}
				if result[0].Length == 0 {
					p = -1
				}
				c.UpdateProgress(job.ID, p)
			}
		}
		time.Sleep(time.Second * 2)
	}
}

func parseArg(p mongodb.Parameter) []string {
	var s []string
	//append "-y" to command so ffmpeg always overwrite any existing output
	s = append(s, "-y")
	for _, e := range p.InputFiles {
		s = append(s, "-i")
		s = append(s, e)
	}
	for k, v := range p.Commands {
		s = append(s, k)
		s = append(s, v)
	}

	s = append(s, p.Output)
	return s
}

func updateStatusClosure(ID string, c *mongodb.MongoClient) func(string) error {
	return func(status string) error {
		err := c.UpdateStatus(ID, status)
		return err
	}
}
