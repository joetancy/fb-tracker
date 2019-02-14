import React, {Component} from 'react';
import {
  Container,
  Grid,
  Header,
  Icon,
  Input,
  Card,
  Form,
  Button,
  Select,
  Loader
} from 'semantic-ui-react';
import MetricCard from './components/MetricCard';
import Swal from 'sweetalert2';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: '',
      currentPage: '',
      links: [],
      oldLinks: [],
      facebookData: [],
      items: [],
      loading: false
    };
    this.loadFacebook = this.loadFacebook.bind(this);
    this.clearLocalStorage = this.clearLocalStorage.bind(this);
    this.addToList = this.addToList.bind(this);
    this.forceRefresh = this.forceRefresh.bind(this);
    this.backupRestore = this.backupRestore.bind(this);
  }

  componentDidMount() {
    this.getFromLocalStorage();
    this.loadFacebook();
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
      this.loginFacebook();
    };
  }

  loginFacebook() {
    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        window.FB.api('/me/accounts?fields=name,access_token', (response) => {
          this.setState({facebookData: response.data});
          this.populateSelect();
        });
      } else {
        console.log('Login Failed!');
      }
    });
  }

  clearLocalStorage() {
    if (window.confirm('Clear all history?')) {
      localStorage.clear();
      this.setState({links: []});
    }
  }

  getFromLocalStorage() {
    if (localStorage.hasOwnProperty('links')) {
      let valueList = localStorage.getItem('links');
      this.setState({links: JSON.parse(valueList)});
    } else {
      this.setState({links: []});
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('links', JSON.stringify(this.state.links));
  }

  loader() {
    if (this.state.loading) {
      return <Loader active />;
    } else {
      return <Loader disabled />;
    }
  }

  backupRestore() {
    Swal.fire({
      title: 'Copy the text contents and save to a file for backup.',
      input: 'textarea',
      inputValue: JSON.stringify(this.state.links),
      inputPlaceholder: 'Type your message here...',
      showCancelButton: true,
      confirmButtonText: 'Restore'
    })
      .then((result) => {
        if (result.value !== undefined) {
          this.setState({links: JSON.parse(result.value)});
          this.saveToLocalStorage();
        }
      })
      .catch();
  }

  forceRefresh() {
    this.setState({oldLinks: this.state.links, links: []});
    this.state.links.forEach((element) => {
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

  populateList() {
    let items = [];
    this.state.links.forEach((element) => {
      items.push(
        <MetricCard
          key={element.postId}
          type={element.type}
          pageName={element.pageName}
          impressions={element.impressions}
          reach={element.reach}
          engagement={element.engagement}
          link={element.link}
          name={element.name}
          message={element.message}
          created_time={element.created_time}
        />
      );
    });
    return items;
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
        let valueList = this.state.links;
        valueList.push(postData);
        this.setState({links: valueList});
        this.saveToLocalStorage();
        this.populateList();
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

        let valueList = this.state.links;
        valueList.push(postData);
        this.setState({links: valueList});
        this.saveToLocalStorage();
        this.populateList();
      }
    );
  };

  handleInputChange = (e) => {
    this.setState({currentValue: e.target.value.split('?')[0]});
  };

  handleDropdownChange = (e, {value}) => {
    this.setState({
      currentPage: value
    });
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
                  <Header.Content>Facebook Insights Tracker</Header.Content>
                </Header>
                <div
                  className="fb-login-button"
                  style={{display: 'block', textAlign: 'center'}}
                  data-size="large"
                  data-button-type="continue_with"
                  data-auto-logout-link="true"
                  data-use-continue-as="true"
                  data-scope="read_insights, manage_pages"
                />
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
              <Grid.Column>
                <Button
                  negative
                  content="Clear History"
                  onClick={this.clearLocalStorage}
                />
                <Button
                  positive
                  content="Force Refresh"
                  onClick={this.forceRefresh}
                />
                <Button
                  content="Backup & Restore"
                  onClick={this.backupRestore}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {this.loader()}
                <Card.Group centered itemsPerRow="3">
                  {this.populateList()}
                </Card.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    );
  }
}

export default App;
