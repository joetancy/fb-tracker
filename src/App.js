import React, {Component} from 'react';
import * as firebase from 'firebase/app';
import 'firebase/firebase-app';
import 'firebase/firebase-firestore';
import * as firebaseui from 'firebaseui';
import _ from 'lodash';
import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  Container,
  Grid,
  Header,
  Icon,
  Form,
  TextArea,
  Button,
  Select,
  Loader,
  Table,
  Segment,
  Label
} from 'semantic-ui-react';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
    this.buildReport = this.buildReport.bind(this);
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
        console.log(user.uid)
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
          scopes: ['manage_pages', 'read_insights'],
          customParameters: {
            auth_type: 'reauthenticate'
          }
        }
      ]
    };
    ui.start('#firebaseui-auth-container', uiConfig);
  }

  signOut() {
    firebase.auth().signOut();
    this.setState({data: []});
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
          let data = _.orderBy(doc.data().data, 'reach', 'asc');
          this.setState({
            loading: false,
            data: data,
            column: 'reach',
            direction: 'ascending'
          });
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

  buildReport() {
    let pdfData = [];
    let data = _.orderBy(this.state.data, 'reach', 'asc');
    pdfData.push([
      'Page',
      'Name',
      'Impressions',
      'Reach',
      'Engagement',
      'Age',
      'Link'
    ]);
    _.forEach(data, (element) => {
      let reach = {text: element.reach.toLocaleString()};
      if (element.reach < 25000) {
        reach['fillColor'] = '#F08080';
      } else if (element.reach < 50000) {
        reach['fillColor'] = '#FF8C00';
      } else if (element.reach < 100000) {
        reach['fillColor'] = '#FFFF00';
      } else if (element.reach < 500000) {
        reach['fillColor'] = '#00FF7F';
      }
      pdfData.push([
        element.pageName,
        element.name,
        element.impressions.toLocaleString(),
        reach,
        element.engagement.toLocaleString(),
        moment(element.created_time, 'DD/MM/YYYY h:mm a').fromNow(),
        {text: 'Link', link: element.link, color: 'blue'}
      ]);
    });

    var docDefinition = {
      pageOrientation: 'landscape',
      pageSize: 'A4',
      content: [
        {text: 'Facebook Reach Tracker', margin: [0, 0, 0, 16], fontSize: 24},
        {
          layout: 'lightHorizontalLines',
          table: {
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: pdfData
          }
        },
        {
          text: 'Generated on ' + moment().format('MMMM Do YYYY, h:mm:ss a'),
          margin: [0, 16, 0, 0],
          fontSize: 8
        }
      ]
    };
    pdfMake.createPdf(docDefinition).open();
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
    let links = this.state.currentValue;
    links = links.split('\n');
    links.forEach((element) => {
      this.getMetrics(element);
    });
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
    //  url = `/${
    //    pageData.value
    //  }_${postId}/?fields=insights.metric(post_impressions,post_impressions_unique,post_video_views),name,message,created_time`;
      url = `/${
        pageData.value
      }_${postId}/video_insights?metric=['total_video_impressions','total_video_impressions_unique','total_video_views']`;
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
        console.log(response);
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
        this.setState({data: valueList, currentValue: ''});
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
                    <br />
                    <Label circular color="orange" empty />
                    {' < 50,000'}
                    <br />
                    <Label circular color="yellow" empty />
                    {' < 100,000'}
                    <br />
                    <Label circular color="green" empty />
                    {' < 500,000'}
                    <br />
                    <Label circular color="blue" empty />
                    {' > 500,000'}
                  </>
                </Segment>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
            <Container>
              <Form onSubmit={this.addToList}>
                <Form.Group>
                  <TextArea
                    defaultValue={this.state.currentValue}
                    onChange={this.handleInputChange}
                    fluid
                    required
                    placeholder="Link"
                    type="text"
                    value={this.state.currentValue}
                    width={8}
                  />
                  <Select
                    placeholder="Page"
                    options={this.state.facebookData}
                    onChange={this.handleDropdownChange}
                    width={3}
                  />
                  <Button type="submit" width={3}>
                    <Icon fitted name="add" />
                  </Button>
                </Form.Group>
              </Form>
            </Container>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={10}>
                <Button
                  color="green"
                  content="Force Refresh"
                  onClick={this.forceRefresh}
                />
                {/* <Button
                  color="teal"
                  content="Get Video"
                  onClick={this.forceRefresh}
                /> */}
                <Button
                  color="blue"
                  content="Export Report"
                  onClick={this.buildReport}
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
                      <Table.HeaderCell>Age</Table.HeaderCell>
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
                        impressions,
                        reach,
                        engagement,
                        link,
                        type,
                        created_time
                      }) => (
                        <Table.Row key={postId}>
                          <Table.Cell>{pageName}</Table.Cell>
                          <Table.Cell>{name}</Table.Cell>
                          <Table.Cell>
                            {impressions.toLocaleString()}
                          </Table.Cell>
                          <Table.Cell>
                            {reach < 25000 ? (
                              <Label color="red" size="large">
                                <Icon name="warning sign" />
                                {reach.toLocaleString()}
                              </Label>
                            ) : reach < 50000 ? (
                              <Label color="orange" size="large">
                                <Icon name="attention" />
                                {reach.toLocaleString()}
                              </Label>
                            ) : reach < 100000 ? (
                              <Label color="yellow" size="large">
                                <Icon name="star half full" />
                                {reach.toLocaleString()}
                              </Label>
                            ) : reach < 500000 ? (
                              <Label color="green" size="large">
                                <Icon name="star" />
                                {reach.toLocaleString()}
                              </Label>
                            ) : (
                              <Label color="blue" size="large">
                                <Icon name="diamond" />
                                {reach.toLocaleString()}
                              </Label>
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
