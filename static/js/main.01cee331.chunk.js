(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{165:function(e,t,a){e.exports=a(301)},170:function(e,t,a){},301:function(e,t,a){"use strict";a.r(t);var n=a(1),o=a.n(n),l=a(40),c=a.n(l),i=(a(170),a(136)),r=a(137),s=a(274),u=a(138),d=a(275),m=a(47),p=a(312),f=a(309),g=a(314),h=a(315),b=a(67),k=a(311),v=a(310),w=function(e){function t(e){var a;return Object(i.a)(this,t),(a=Object(s.a)(this,Object(u.a)(t).call(this,e))).addToList=function(e){e.preventDefault();var t=a.state.list;t.push(a.state.currentValue),a.setState({list:t}),a.saveToLocalStorage()},a.handleInputChange=function(e){a.setState({currentValue:e.target.value.split("?")[0]})},a.state={currentValue:"",list:[],facebookData:[]},a.loadFacebook=a.loadFacebook.bind(Object(m.a)(Object(m.a)(a))),a}return Object(d.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){this.getFromLocalStorage(),this.loadFacebook()}},{key:"loadFacebook",value:function(){!function(e,t,a){var n,o=e.getElementsByTagName(t)[0];e.getElementById(a)||((n=e.createElement(t)).id=a,n.src="https://connect.facebook.net/en_US/sdk.js",o.parentNode.insertBefore(n,o))}(document,"script","facebook-jssdk"),window.fbAsyncInit=function(){window.FB.init({appId:"123763181800839",autoLogAppEvents:!0,xfbml:!0,version:"v3.2",state:!0}),window.FB.getLoginStatus(function(e){console.log(e),"connected"===e.status?window.FB.api("/me/accounts?fields=name,access_token",function(e){console.log(e),this.setState({facebookData:e})}):console.log("failed!")})}}},{key:"getFromLocalStorage",value:function(){if(localStorage.hasOwnProperty("list")){var e=localStorage.getItem("list");this.setState({list:JSON.parse(e)})}}},{key:"saveToLocalStorage",value:function(){localStorage.setItem("list",JSON.stringify(this.state.list))}},{key:"populateList",value:function(){for(var e=[],t=this.state.list,a=0;a<t.length;a++){var n=t[a];e.push(o.a.createElement(p.a.Item,{key:a},n))}return e}},{key:"render",value:function(){return o.a.createElement("div",{className:"App"},o.a.createElement(f.a,null,o.a.createElement(g.a,{centered:!0,padded:!0,columns:1,divided:!0},o.a.createElement(g.a.Row,null,o.a.createElement(g.a.Column,null,o.a.createElement(h.a,{as:"h1",icon:!0,textAlign:"center"},o.a.createElement(b.a,{name:"facebook"}),o.a.createElement(h.a.Content,null,"Facebook")),o.a.createElement("div",{className:"fb-login-button",style:{display:"block",textAlign:"center"},"data-size":"large","data-button-type":"continue_with","data-auto-logout-link":"true","data-use-continue-as":"true"}))),o.a.createElement(g.a.Row,null,o.a.createElement(g.a.Column,null,o.a.createElement(k.a,{onSubmit:this.addToList},o.a.createElement(v.a,{defaultValue:this.state.currentValue,onChange:this.handleInputChange,fluid:!0,required:!0,placeholder:"Link",type:"url",action:{icon:"add",type:"submit"}})))),o.a.createElement(g.a.Row,null,o.a.createElement(g.a.Column,null,o.a.createElement(p.a,null,this.populateList()))))))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a(270);c.a.render(o.a.createElement(w,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[165,2,1]]]);
//# sourceMappingURL=main.01cee331.chunk.js.map