import React, {Component} from 'react';
import {
  Container,
  Grid,
  Header,
  Icon,
  Input,
  List,
  Form
} from 'semantic-ui-react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {currentValue: '', list: []};
  }

  componentDidMount() {
    this.getFromLocalStorage();
  }

  getFromLocalStorage() {
    if (localStorage.hasOwnProperty('list')) {
      let valueList = localStorage.getItem('list');
      this.setState({list: JSON.parse(valueList)});
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('list', JSON.stringify(this.state.list));
  }

  populateList() {
    let items = [];
    let valueList = this.state.list;
    for (let index = 0; index < valueList.length; index++) {
      const element = valueList[index];
      items.push(<List.Item key={index}>{element}</List.Item>);
    }
    return items;
  }

  addToList = (e) => {
    e.preventDefault();
    let valueList = this.state.list;
    valueList.push(this.state.currentValue);
    this.setState({list: valueList});
    this.saveToLocalStorage();
  };

  handleInputChange = (e) => {
    this.setState({currentValue: e.target.value.split('?')[0]});
  };

  render() {
    return (
      <div className="App">
        <Container>
          <Grid centered padded columns={1} divided>
            <Grid.Row>
              <Grid.Column>
                <Header as="h1" icon textAlign="center">
                  <Icon name="facebook" />
                  <Header.Content>Facebook</Header.Content>
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Form onSubmit={this.addToList}>
                  <Input
                    defaultValue={this.state.currentValue}
                    onChange={this.handleInputChange}
                    fluid
                    required
                    placeholder="Link"
                    type="url"
                    action={{
                      icon: 'add',
                      type: 'submit'
                    }}
                  />
                </Form>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <List>{this.populateList()}</List>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    );
  }
}

export default App;
