(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{164:function(e,t,a){e.exports=a(300)},169:function(e,t,a){},300:function(e,t,a){"use strict";a.r(t);var n=a(1),o=a.n(n),l=a(40),c=a.n(l),i=(a(169),a(135)),s=a(136),r=a(274),u=a(137),d=a(275),m=a(311),f=a(308),g=a(313),p=a(314),h=a(60),v=a(310),k=a(309),w=function(e){function t(e){var a;return Object(i.a)(this,t),(a=Object(r.a)(this,Object(u.a)(t).call(this,e))).addToList=function(e){e.preventDefault();var t=a.state.list;t.push(a.state.currentValue),a.setState({list:t}),a.saveToLocalStorage()},a.handleInputChange=function(e){a.setState({currentValue:e.target.value.split("?")[0]})},a.state={currentValue:"",list:[]},a}return Object(d.a)(t,e),Object(s.a)(t,[{key:"componentDidMount",value:function(){this.getFromLocalStorage(),this.loadFacebook()}},{key:"loadFacebook",value:function(){!function(e,t,a){var n,o=e.getElementsByTagName(t)[0];e.getElementById(a)||((n=e.createElement(t)).id=a,n.src="https://connect.facebook.net/en_US/sdk.js",o.parentNode.insertBefore(n,o))}(document,"script","facebook-jssdk"),window.fbAsyncInit=function(){window.FB.init({appId:"123763181800839",autoLogAppEvents:!0,xfbml:!0,version:"v3.2",state:!0})}}},{key:"checkLoginState",value:function(){window.FB.getLoginStatus(function(e){console.log(e),"connected"===e.status?window.FB.api("/me/accounts?fields=name,access_token",function(e){console.log("Successful login for: "+e.name)}):console.log("failed!")})}},{key:"getFromLocalStorage",value:function(){if(localStorage.hasOwnProperty("list")){var e=localStorage.getItem("list");this.setState({list:JSON.parse(e)})}}},{key:"saveToLocalStorage",value:function(){localStorage.setItem("list",JSON.stringify(this.state.list))}},{key:"populateList",value:function(){for(var e=[],t=this.state.list,a=0;a<t.length;a++){var n=t[a];e.push(o.a.createElement(m.a.Item,{key:a},n))}return e}},{key:"render",value:function(){return o.a.createElement("div",{className:"App"},o.a.createElement(f.a,null,o.a.createElement(g.a,{centered:!0,padded:!0,columns:1,divided:!0},o.a.createElement(g.a.Row,null,o.a.createElement(g.a.Column,{centered:!0},o.a.createElement(p.a,{as:"h1",icon:!0,textAlign:"center"},o.a.createElement(h.a,{name:"facebook"}),o.a.createElement(p.a.Content,null,"Facebook")),o.a.createElement("div",{className:"fb-login-button",style:{display:"block",textAlign:"center"},"data-size":"large","data-button-type":"continue_with","data-auto-logout-link":"false","data-use-continue-as":"false",onlogin:this.checkLoginState}))),o.a.createElement(g.a.Row,null,o.a.createElement(g.a.Column,null,o.a.createElement(v.a,{onSubmit:this.addToList},o.a.createElement(k.a,{defaultValue:this.state.currentValue,onChange:this.handleInputChange,fluid:!0,required:!0,placeholder:"Link",type:"url",action:{icon:"add",type:"submit"}})))),o.a.createElement(g.a.Row,null,o.a.createElement(g.a.Column,null,o.a.createElement(m.a,null,this.populateList()))))))}}]),t}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a(270);c.a.render(o.a.createElement(w,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[164,2,1]]]);
//# sourceMappingURL=main.dbab2736.chunk.js.map