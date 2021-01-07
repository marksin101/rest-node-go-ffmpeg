package encode

import (
	"fmt"
	"strings"
)

//ArgChecker - check if arguments contain illegal character like "$" "&"
func ArgChecker(p []string) error {
	illegal := []string{"$", "&", ">", "<"}
	for _, e := range p {
		for _, c := range illegal {
			if strings.Contains(e, c) {
				return fmt.Errorf("Argument %s contains illegal character %s", e, c)
			}
		}
	}
	return nil
}
