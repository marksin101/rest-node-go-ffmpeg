package encode

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"math/rand"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

//Encode using parameters passed from Start()
func Encode(c Channels, p []string) {
	tmp := c.Transmit
	c.Transmit = c.Receive
	c.Receive = tmp
	cmd := exec.Command("ffmpeg", p...)
	//log output for ffmpeg is stderr
	stdout, err := cmd.StderrPipe()
	if err != nil {
		log.Fatal(err)
	}
	scanner := bufio.NewScanner(stdout)
	scanner.Split(bufio.ScanWords)
	r := bufio.NewReader(stdout)
	readBuff := make([]byte, 1500)
	rand.Seed(time.Now().UnixNano())
	random := rand.Intn(100-2) + 2
	//This would fail in non-unix OS but this program is supposed to run in docker container anyway
	logOutput := "/tmp/errorlog" + strconv.Itoa(random) + ".txt"
	file, err := os.Create(logOutput)
	if err != nil {
		log.Println(err)
	}
	w := bufio.NewWriter(file)
	err = cmd.Start()
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		for {
			l, err := r.Read(readBuff)
			if err != nil {
				if err == io.EOF {
					w.Write(readBuff[:l])
					w.Flush()
					break
				}
			}
			w.Write(readBuff[:l])
		}
	}()
	go func() {
		if err := cmd.Wait(); err != nil {
			if err.Error() == "signal: killed" {
				os.Remove(logOutput)
			} else {
				c.Transmit <- Message{Error: fmt.Errorf("%s", logOutput), Terminated: true}
			}
		} else {
			os.Remove(logOutput)
			time.Sleep(time.Millisecond * 500)
			c.Transmit <- Message{Terminated: true}
		}
	}()
	go func() {
		p := <-c.Receive
		if p.shouldTerminate {
			if err := cmd.Process.Kill(); err != nil {
				c.EmergencyMsg <- Message{Error: err, Terminated: false}
			} else {
				c.EmergencyMsg <- Message{Terminated: true}
			}
		}
	}()
	time.Sleep(time.Second * 2)
	for {
	innerLoop:
		for scanner.Scan() {
			output := scanner.Text()
			if strings.Contains(output, "time") {
				progress := calProgress(output)
				c.Transmit <- Message{isUpdate: true, progress: progress, Terminated: false}
				break innerLoop
			}
		}
		time.Sleep(time.Second * 2)
	}
}

func calProgress(output string) int {
	time := strings.Split(output, "=")
	time = strings.Split(time[1], ".")
	time = strings.Split(time[0], ":")
	hour, _ := strconv.Atoi(time[0])
	minute, _ := strconv.Atoi(time[1])
	second, _ := strconv.Atoi(time[2])
	progress := 3600*hour + 60*minute + second
	return progress
}
