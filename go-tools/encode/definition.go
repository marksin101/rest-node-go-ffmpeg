package encode

// Message channel for communication with goroutine
type Message struct {
	progress                              int
	shouldTerminate, Terminated, isUpdate bool
	Error                                 error
}

//Channels aggregation of communication channels between Start() and Encode ()
type Channels struct {
	Transmit, Receive, EmergencyMsg chan Message
}
