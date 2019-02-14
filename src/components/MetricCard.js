import React, {Component} from 'react';
import {Card, Button, Grid, Container} from 'semantic-ui-react';

export default class MetricCard extends Component {
  engagement() {
    if (this.props.type === 'video') {
      return (
        <Grid.Column textAlign="center">
          Video Views<p>{this.props.engagement.toLocaleString()}</p>
        </Grid.Column>
      );
    } else {
      return (
        <Grid.Column textAlign="center">
          Post Clicks<p>{this.props.engagement.toLocaleString()}</p>
        </Grid.Column>
      );
    }
  }

  render() {
    return (
      <Card>
        <Card.Content header={this.props.header}>
          {this.props.pageName}
          <Card.Meta>{this.props.created_time}</Card.Meta>
        </Card.Content>
        <Card.Content>
          <p>
            <strong>{this.props.name}</strong>
          </p>
          <p>{this.props.message}</p>
        </Card.Content>
        <Card.Content>
          <Container>
            <Grid columns={3}>
              <Grid.Row>
                <Grid.Column textAlign="center">
                  Impressions<p>{this.props.impressions.toLocaleString()}</p>
                </Grid.Column>
                <Grid.Column textAlign="center">
                  Reach<p>{this.props.reach.toLocaleString()}</p>
                </Grid.Column>
                {this.engagement()}
              </Grid.Row>
            </Grid>
          </Container>
        </Card.Content>
        <Card.Content extra>
          <a href={this.props.link} target="_blank" rel="noopener noreferrer">
            <Button basic color="blue" content="View" />
          </a>
        </Card.Content>
      </Card>
    );
  }
}
