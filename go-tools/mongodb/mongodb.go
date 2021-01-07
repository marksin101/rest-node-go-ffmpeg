package mongodb

import (
	"context"
	"errors"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

//Job structure of the job retreived from mongodb
type Job struct {
	ID         string `json:"_id" bson:"_id"`
	Progress   string `json:"progress" bson:"progress"`
	Status     string `json:"status" bson:"status"`
	Length     int    `json:"length" bson:"length"`
	Parameters Parameter
}

//Parameter commands pass directly to ffmpeg
type Parameter struct {
	InputFiles []string          `json:"inputFiles" bson:"inputFiles"`
	Output     string            `json:"output" bson:"output"`
	Commands   map[string]string `json:"commands" bson:"commands"`
}

//MongoClient Connection pointer
type MongoClient struct {
	C *mongo.Collection
}

//Initialization Get the pointer pointing to job collection
func Initialization(URL string) (*mongo.Collection, error) {
	client, err := mongo.NewClient(options.Client().ApplyURI(URL))
	if err != nil {
		return nil, err
	}
	ctx, _ := context.WithTimeout(context.Background(), 2*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		return nil, err
	}
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, err
	}
	collectionJobs := client.Database("ffmpegMERN").Collection("jobs")
	return collectionJobs, nil
}

//UpdateProgress update progress for certain job
func (m *MongoClient) UpdateProgress(id string, progress int) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	ctx, _ := context.WithTimeout(context.Background(), 2*time.Second)
	//convert progress to string and append %
	p := strconv.Itoa(progress)
	p = p + "%"
	_, err = m.C.UpdateOne(
		ctx, bson.M{"_id": objID}, bson.M{
			"$set": bson.M{
				"progress": p,
			},
		},
	)
	if err != nil {
		return err
	}
	return nil
}

//Query get all job details
func (m *MongoClient) Query(JobArray []string) ([]Job, error) {
	var empty []Job
	var Jobs []Job
	ctx, _ := context.WithTimeout(context.Background(), 2*time.Second)
	for _, e := range JobArray {
		job, err := retrieveData(ctx, m.C, e)
		if err != nil {
			return empty, err
		}
		Jobs = append(Jobs, job)
	}
	return Jobs, nil

}

func retrieveData(ctx context.Context, c *mongo.Collection, JobID string) (Job, error) {
	objectID, err := primitive.ObjectIDFromHex(JobID)
	if err != nil {
		return Job{}, errors.New("Wrong id")
	}
	result := Job{}
	c.FindOne(ctx, bson.M{"_id": objectID}).Decode(&result)
	return result, nil
}

// UpdateStatus update job status based on id
func (m *MongoClient) UpdateStatus(id string, status string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	ctx, _ := context.WithTimeout(context.Background(), 2*time.Second)
	_, err = m.C.UpdateOne(
		ctx, bson.M{"_id": objID}, bson.M{
			"$set": bson.M{
				"status": status,
			},
		},
	)
	if err != nil {
		return err
	}
	return nil
}
