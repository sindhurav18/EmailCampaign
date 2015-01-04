
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , sql=require('./routes/mysql')
  , contacts=require('./routes/contacts')
  ,email=require('./routes/emailDesginer');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({secret: 'Ummmhmmmmm'})); 
app.use(app.router);
// development only
if ('development' == app.get('env')) 
{
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/contactTest',contacts.addBulkContacts);
//get signup view
app.get('/Sign-up',routes.getSignupPage);
app.get('/Home',routes.getHome);
app.get('/About-us',routes.getAboutUs);
app.get('/Features',routes.getFeatures);
app.get('/contacts',routes.getContacts);
app.get('/email',routes.getEmailsPage);
app.get('/index',routes.getIndexPage);
app.get('/signin',routes.getSignInPage);
app.get('/logout',user.logout);
app.get('/createList',routes.getCreateListView);
app.get('/templates',routes.getTemplateView);
app.get('/listOverView',routes.getListOverView);
app.get('/AddContacts',routes.AddContacts);
app.get('/classicTemplate',routes.getClassicTemplate);
app.get('/personalTemplate',routes.getPersonalTemplate);
app.get('/professionalTemplate',routes.getProfessionalTemplate);
app.get('/createEmailPage',routes.getCreateEmailPage);
app.get('/createEmailPage',routes.getCreateEmailPage);
app.get('/createEmailPageTemplate',routes.getSendEmailUsingTemplate);




//login
app.post('/Login',user.login);
app.post('/SignUp',user.register);
app.post('/createNewList',contacts.createGroup);
app.post('/addContact',contacts.addBulkContacts);
app.post('/getSubjectSuggestions',email.checkEmailSubjectLine);
app.post('/sendEmail',email.sendEmail);
app.post('/sendTemplateEmail',routes.sendTemplateEmail);
app.post('/createEmailPageTemplate',routes.getSendEmailUsingTemplate);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  sql.initializeDatabaseConnectionPool();
});
