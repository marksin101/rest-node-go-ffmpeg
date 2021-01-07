package parameter

import (
	"errors"
	"flag"
	"os"
)

type idFlags []string

// Implementing flag.Value interface
func (i *idFlags) String() string {
	return "abcdefg"
}

func (i *idFlags) Set(value string) error {
	*i = append(*i, value)
	return nil
}

//Arguments passed by user at runtime
type Arguments struct {
	URL        string
	JobID      []string
	IsOnebyOne bool
}

// HandleParameter - Parse Flags
func HandleParameter(arg []string) (Arguments, error) {
	p := Arguments{}
	usage := "Usage: -m \"Mongodb URL\" -id \"JobID\" -s=true|false"
	if len(arg) == 1 {
		return p, errors.New(usage)
	}
	if os.Args[1] == "-v" {
		return p, errors.New("This is part of ffwebui. Couldn't function alone")
	}
	var jobID idFlags
	dbURL := flag.String("m", "", "Mongodb URL e.g. mongodb://localhost:27017")
	flag.Var(&jobID, "id", "JobID")
	isOneByOne := flag.Bool("s", false, "Run all jobs simulataneously")
	flag.Parse()
	//check if inputs are valid
	if len(jobID) == 0 {
		return p, errors.New(usage)

	}
	if *dbURL == "" {
		return p, errors.New(usage)

	}
	p = Arguments{URL: *dbURL, JobID: jobID, IsOnebyOne: *isOneByOne}
	return p, nil
}
