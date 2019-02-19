import React, {Component} from 'react';
import firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import _ from 'lodash';
import moment from 'moment';
import {
  Container,
  Grid,
  Header,
  Icon,
  Input,
  Form,
  Button,
  Select,
  Loader,
  Table,
  Segment,
  Label
} from 'semantic-ui-react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: '',
      currentValue: '',
      currentPage: '',
      data: [],
      oldData: [],
      facebookData: [],
      items: [],
      loading: false,
      appUserID: '',
      column: null,
      direction: null
    };
    this.loadFacebook = this.loadFacebook.bind(this);
    this.addToList = this.addToList.bind(this);
    this.forceRefresh = this.forceRefresh.bind(this);
    this.firebaseUI = this.firebaseUI.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  componentDidMount() {
    this.loadFacebook();
    var config = {
      apiKey: 'AIzaSyCi8s6wYR8LT2hTLwOgEAmduO_3qZE_ohE',
      authDomain: 'facebooktest-f856a.firebaseapp.com',
      projectId: 'facebooktest-f856a'
    };
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.loginFacebook();
        this.setState({appUserID: user.uid});
        this.setState({loading: true});
      } else {
        this.firebaseUI();
      }
    });
  }

  firebaseUI() {
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          this.setState({accessToken: authResult.credential.accessToken});
          this.loginFacebook();
          return false;
        }
      },
      signInFlow: 'popup',
      signInOptions: [
        {
          provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          scopes: ['manage_pages', 'read_insights']
        }
      ]
    };
    ui.start('#firebaseui-auth-container', uiConfig);
  }

  signOut() {
    firebase.auth().signOut();
  }

  loadFacebook() {
    ((d, s, id) => {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: '1497929310342175',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v3.2',
        state: true
      });
    };
  }

  loginFacebook() {
    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        window.FB.api(
          '/me/accounts?fields=id,name,access_token',
          (response) => {
            this.setState({facebookData: response.data});
            this.getFromDB();
            this.populateSelect();
          }
        );
      } else {
        console.log('Login Failed!');
      }
    });
  }

  getFromDB() {
    const db = firebase.firestore();
    var docRef = db.collection('records').doc(this.state.appUserID);
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          this.setState({loading: false, data: doc.data().data});
        } else {
          console.log('No such document!');
          this.setState({loading: false});
        }
      })
      .catch((error) => {
        console.log('Error getting document', error);
      });
  }

  saveToDB() {
    const db = firebase.firestore();
    db.collection('records')
      .doc(this.state.appUserID)
      .set(
        {
          data: this.state.data
        },
        {merge: true}
      );
  }

  loader() {
    if (this.state.loading) {
      return <Loader active />;
    } else {
      return <Loader disabled />;
    }
  }

  forceRefresh() {
    this.setState({oldData: this.state.data, data: []});
    this.state.data.forEach((element) => {
      this.getMetricsRefresh(element);
    });
  }

  populateSelect() {
    let pages = [];
    this.state.facebookData.forEach((element) => {
      pages.push({
        value: element.id,
        text: element.name,
        access_token: element.access_token
      });
    });
    pages.sort((a, b) => {
      return a.text.localeCompare(b.text);
    });
    this.setState({facebookData: pages});
  }

  addToList = (e) => {
    e.preventDefault();
    this.getMetrics(this.state.currentValue);
  };

  getMetricsRefresh = (element) => {
    this.setState({loading: true});
    let pageData;
    let postData;
    let type = element.type;
    let postId = element.postId;
    let url;
    this.state.facebookData.forEach((e) => {
      if (element.pageId === e.value) {
        pageData = e;
      }
    });
    if (type === 'video') {
      url = `/${
        pageData.value
      }_${postId}/?fields=insights.metric(post_impressions,post_impressions_unique,post_video_views),name,message,created_time`;
    } else {
      url = `/${
        pageData.value
      }_${postId}/?fields=insights.metric(post_impressions,post_impressions_unique,post_clicks),name,message,created_time`;
    }
    window.FB.api(
      url,
      {
        access_token: pageData.access_token
      },
      (response) => {
        if (type === 'video') {
          postData = {
            link: element.link,
            postId: postId,
            pageId: pageData.value,
            pageName: pageData.text,
            type: type,
            name: response.name,
            message: response.message,
            created_time: new Date(response.created_time).toLocaleString(
              'en-SG'
            ),
            impressions: response.insights.data[2].values[0].value,
            reach: response.insights.data[3].values[0].value,
            engagement: response.insights.data[1].values[0].value
          };
        } else {
          postData = {
            link: element.link,
            postId: postId,
            pageId: pageData.value,
            pageName: pageData.text,
            type: type,
            name: response.name,
            message: response.message,
            created_time: new Date(response.created_time).toLocaleString(
              'en-SG'
            ),
            impressions: response.insights.data[0].values[0].value,
            reach: response.insights.data[1].values[0].value,
            engagement: response.insights.data[2].values[0].value
          };
        }
        let valueList = this.state.data;
        valueList.push(postData);
        this.setState({data: valueList});
        this.saveToDB();
        this.setState({loading: false});
      }
    );
  };

  getMetrics = (link) => {
    let pageData;
    let postData;
    let type;
    let postId;
    let url;
    this.state.facebookData.forEach((element) => {
      if (this.state.currentPage === element.value) {
        pageData = element;
      }
    });
    if (link.includes('videos')) {
      type = 'video';
      postId = link
        .slice(0, -1)
        .split('/')
        .pop();
      url = `/${
        pageData.value
      }_${postId}/?fields=insights.metric(post_impressions,post_impressions_unique,post_video_views),name,message,created_time`;
    } else {
      type = 'posts';
      postId = link.split('/').pop();
      url = `/${
        pageData.value
      }_${postId}/?fields=insights.metric(post_impressions,post_impressions_unique,post_clicks),name,message,created_time`;
    }
    window.FB.api(
      url,
      {
        access_token: pageData.access_token
      },
      (response) => {
        if (type === 'video') {
          postData = {
            link: link,
            postId: postId,
            pageId: pageData.value,
            pageName: pageData.text,
            type: type,
            name: response.name,
            message: response.message,
            created_time: new Date(response.created_time).toLocaleString(
              'en-SG'
            ),
            impressions: response.insights.data[2].values[0].value,
            reach: response.insights.data[3].values[0].value,
            engagement: response.insights.data[1].values[0].value
          };
        } else {
          postData = {
            link: link,
            postId: postId,
            pageId: pageData.value,
            pageName: pageData.text,
            type: type,
            name: response.name,
            message: response.message,
            created_time: new Date(response.created_time).toLocaleString(
              'en-SG'
            ),
            impressions: response.insights.data[0].values[0].value,
            reach: response.insights.data[1].values[0].value,
            engagement: response.insights.data[2].values[0].value
          };
        }

        let valueList = this.state.data;
        valueList.push(postData);
        this.setState({data: valueList});
        this.saveToDB();
      }
    );
  };

  deleteRow = (postId) => {
    let data = this.state.data;
    let oldData = _.remove(data, (element) => {
      if (element.postId === postId) {
        return true;
      }
    });
    this.setState({data: data});
    this.saveToDB();
    const db = firebase.firestore();
    var docRef = db.collection('records').doc(this.state.appUserID);
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          if (doc.data().archive !== undefined) {
            let archive = doc.data().archive;
            archive.push(oldData[0]);
            db.collection('records')
              .doc(this.state.appUserID)
              .set(
                {
                  archive: archive
                },
                {merge: true}
              );
          } else {
            db.collection('records')
              .doc(this.state.appUserID)
              .set(
                {
                  archive: oldData
                },
                {merge: true}
              );
          }
        } else {
          console.log('No such document!');
        }
      })
      .catch((error) => {
        console.log('Error getting document', error);
      });
  };

  handleInputChange = (e) => {
    this.setState({currentValue: e.target.value.split('?')[0]});
  };

  handleDropdownChange = (e, {value}) => {
    this.setState({
      currentPage: value
    });
  };

  handleSort = (clickedColumn) => () => {
    const {column, data, direction} = this.state;
    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: _.sortBy(data, [clickedColumn]),
        direction: 'ascending'
      });

      return;
    }
    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending'
    });
  };

  render() {
    const {column, direction} = this.state;
    return (
      <div className="App">
        <Container fluid>
          <Grid centered padded columns={3}>
            <Grid.Row centered>
              <Grid.Column width={3} />
              <Grid.Column width={10}>
                <Header as="h1" icon textAlign="center">
                  <Icon name="facebook" />
                  <Header.Content>Facebook Insights Tracker</Header.Content>
                </Header>
                <div id="firebaseui-auth-container" />
              </Grid.Column>
              <Grid.Column width={3}>
                <Segment>
                  <Header>Legend</Header>
                  <>
                    <Label circular color="red" empty />
                    {' < 25,000'}
                  </>
                  <br />
                  <>
                    <Label circular color="orange" empty />
                    {' < 50,000'}
                  </>
                  <br />
                  <>
                    <Label circular color="blue" empty />
                    {' < 100,000'}
                  </>
                  <br />
                  <>
                    <Label circular color="green" empty />
                    {' < 500,000'}
                  </>
                  <br />
                  <>
                    <Icon name="star outline" fitted />
                    {' > 500,000'}
                  </>
                </Segment>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={10}>
                <Form onSubmit={this.addToList}>
                  <Input
                    defaultValue={this.state.currentValue}
                    onChange={this.handleInputChange}
                    fluid
                    required
                    placeholder="Link"
                    type="url"
                  >
                    <input />
                    <Select
                      placeholder="Page"
                      options={this.state.facebookData}
                      onChange={this.handleDropdownChange}
                    />
                    <Button type="submit">
                      <Icon fitted name="add" />
                    </Button>
                  </Input>
                </Form>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={10}>
                <Button
                  positive
                  content="Force Refresh"
                  onClick={this.forceRefresh}
                />
                <Button content="Sign Out" onClick={this.signOut} />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={10}>
                {this.loader()}
                <Table striped compact sortable fixed singleLine>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Page</Table.HeaderCell>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      {/* <Table.HeaderCell>Message</Table.HeaderCell> */}
                      <Table.HeaderCell
                        sorted={column === 'impressions' ? direction : null}
                        onClick={this.handleSort('impressions')}
                      >
                        Impressions
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'reach' ? direction : null}
                        onClick={this.handleSort('reach')}
                      >
                        Reach
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'engagement' ? direction : null}
                        onClick={this.handleSort('engagement')}
                      >
                        Engagement
                      </Table.HeaderCell>
                      <Table.HeaderCell>Days Posted</Table.HeaderCell>
                      <Table.HeaderCell>Action</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {_.map(
                      this.state.data,
                      ({
                        pageName,
                        postId,
                        name,
                        // message,
                        impressions,
                        reach,
                        engagement,
                        link,
                        type,
                        created_time
                      }) => (
                        <Table.Row>
                          <Table.Cell>{pageName}</Table.Cell>
                          <Table.Cell>{name}</Table.Cell>
                          {/* <Table.Cell>{message}</Table.Cell> */}
                          <Table.Cell>
                            {impressions.toLocaleString()}
                          </Table.Cell>
                          <Table.Cell>
                            {reach < 25000 ? (
                              <Header as="h5" color="red">
                                {reach.toLocaleString()}
                              </Header>
                            ) : reach < 50000 ? (
                              <Header as="h5" color="orange">
                                {reach.toLocaleString()}
                              </Header>
                            ) : reach < 100000 ? (
                              <Header as="h5" color="blue">
                                {reach.toLocaleString()}
                              </Header>
                            ) : reach < 500000 ? (
                              <Header as="h5" color="green">
                                {reach.toLocaleString()}
                              </Header>
                            ) : (
                              <>
                                {reach.toLocaleString()}
                                <Icon name="star outline" />
                              </>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <p>
                              {type === 'video'
                                ? 'Video Views '
                                : 'Post Clicks '}
                            </p>
                            {engagement.toLocaleString()}
                          </Table.Cell>
                          <Table.Cell>
                            {moment(
                              created_time,
                              'DD/MM/YYYY h:mm a'
                            ).fromNow()}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button basic color="blue" icon="eye" />
                            </a>
                            <Button
                              basic
                              color="red"
                              icon="trash alternate outline"
                              onClick={() => this.deleteRow(postId)}
                            />
                          </Table.Cell>
                        </Table.Row>
                      )
                    )}
                  </Table.Body>
                </Table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    );
  }
}

export default App;
