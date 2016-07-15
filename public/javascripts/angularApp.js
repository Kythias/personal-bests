var app = angular.module('personalBest', [
    'ui.router',
    'ui.bootstrap'
    ]);

app.factory('records', ['$http', 'auth', function($http, auth){
    var o = {
        bests: [],
        liftList: [
            {name: 'Clean'},
            {name: 'Clean (2RM)'},
            {name: 'Clean (3RM)'},
            {name: 'Clean & Jerk'},
            {name: 'Push Press'},
            {name: 'Push Press (2RM)'},
            {name: 'Push Press (3RM)'},
            {name: 'Strict Press'},
            {name: 'Strict Press (2RM)'},
            {name: 'Strict Press (3RM)'},
            {name: 'Deadlift'},
            {name: 'Snatch'},
            {name: 'Snatch (2RM)'},
            {name: 'Snatch (3RM)'},
            {name: 'Front Squat'},
            {name: 'Front Squat (2RM)'},
            {name: 'Front Squat (3RM)'},
            {name: 'Back Squat'},
            {name: 'Back Squat (2RM)'},
            {name: 'Back Squat (3RM)'},
            {name: 'Overhead Squat'},
            {name: 'Thruster'}
            ]
    };
    
    o.getAll = function() {
        return $http.get('/bests').success(function(data){
            angular.copy(data, o.bests);
        });
    };
    
    o.getMine = function(username) {
        return $http.get('/profile/' + username).success(function(data){
            angular.copy(data, o.bests);
        });
    };
    
    o.add = function(best){
        return $http.post('/bests', best, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.bests.push(data);
        });
    };
    
    o.remove = function(id, index){
        return $http.delete('/bests/' + id, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.bests.splice(index, 1);
        });
    };
    
    return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};
    
    auth.saveToken = function (token){
        $window.localStorage['personal-bests-token'] = token;
    };
    
    auth.getToken = function (){
        return $window.localStorage['personal-bests-token'];
    };
    
    auth.isLoggedIn = function(){
        var token = auth.getToken();
        
        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    
    auth.currentUser = function() {
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.username;
        }
    };
    
    auth.currentNames = function() {
        if(auth.isLoggedIn()){
            var token= auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            
            return payload.firstName + ' ' + payload.lastName;
        }
    };
    
    auth.register = function(user){
        return $http.post('/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    
    auth.logOut = function(){
        $window.localStorage.removeItem('personal-bests-token');
    };
    
    return auth;
}]);

app.factory('userdata', ['$http', function($http){
        var user = {
            stuff: []
        };
        
        user.getInfo = function(username){
            return $http.get('/user/' + username).success(function(data){
                angular.copy(data, user.stuff)
            });
        };
        
        return user;
    }]);

app.controller('MainCtrl', ['records', 'auth', function(records, auth){
    
    var self = this;
    
    self.lifts = records.bests;
    
    self.username = auth.currentUser();
    
    self.remove = function(id, index){
        records.remove(id, index);
    };
    
    self.liftList = records.liftList;
    
    self.myProfile = false;
    
    
    }]);
    
app
    .controller('NewLiftCtrl', ['records', function(records){
    var self = this;
    
    self.liftList = records.liftList;
    
    self.addLift = function(newTitle, newWeight){
        if(!self.newTitle || !self.newWeight) {return;}
        records.add({
            title: self.newTitle,
            weight: self.newWeight
        });
        self.newTitle = null;
        self.newWeight = null;
        
    };
}])
    .controller('AuthCtrl', ['$state', 'auth', function($state, auth){
        var self = this;
        
        self.user = {};
        
        self.register = function(){
            auth.register(self.user).error(function(error){
                self.error = error;
            }).then(function(){
                $state.go('home');
            });
        };
        
        self.logIn = function(){
            auth.logIn(self.user).error(function(error){
                self.error = error;
            }).then(function(){
                $state.go('home');
            });
        };
    }])
    .controller('NavCtrl', [
        'auth',
        function(auth){
            var self = this;
            
            self.isLoggedIn = auth.isLoggedIn;
            self.currentUser = auth.currentUser;
            self.me = auth.currentNames();
            self.logOut = auth.logOut;
    }])
    .controller('ProfileCtrl', [
        'auth',
        'records',
        'userdata',
        '$state',
        '$stateParams',
        function(auth, records, userdata, $state, $stateParams){
            var self = this;
            
            self.profileOwner = userdata.stuff[0].firstName;
            self.profileDetails = userdata.stuff[0].firstName + ' ' + userdata.stuff[0].lastName + ' (' + userdata.stuff[0].username + ')';
            
            self.myLifts = records.bests;
            
            self.myProfile = function() {
                return $stateParams.username == auth.currentUser();
            };
            
            self.liftList = records.liftList;
    
            self.addLift = function(newTitle, newWeight){
                if(!self.newTitle || !self.newWeight) {return;}
                records.add({
                    title: self.newTitle,
                    weight: self.newWeight
                });
                
            self.newTitle = null;
            self.newWeight = null;
            };
            
            this.propertyName = 'date';
            this.reverse = true;
            
            this.sortBy = function(propertyName) {
                this.reverse = (this.propertyName === propertyName) ? !this.reverse : false;
                this.propertyName = propertyName;
            };
        }]);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        
        $stateProvider
        .state('home', {
            url: '/home',
            views: {
                'recordslist': {
                    templateUrl: 'templates/main-list-template.html',
                    controller: 'MainCtrl',
                    controllerAs: 'main',
                    
                },
        },
            resolve: {
                postPromise: ['records', function(records){
                    return records.getAll();
                }],
                namePromise: ['auth', function(auth){
                    return auth.currentNames();
                }]
            }
        })
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'AuthCtrl',
            controllerAs: 'login',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('home');
                }
            }]
        })
        .state('register', {
            url: '/register',
            templateUrl: 'templates/register.html',
            controller: 'AuthCtrl',
            controllerAs: 'reg',
            onEnter: ['$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('home');
                }
            }]
        })
        .state('profiles', {
            url: '/profile/{username}',
            views: {
                'profileMain': {
                    templateUrl: 'templates/profile-template.html',
                    controller: 'ProfileCtrl',
                    controllerAs: 'prof'
                },
                'newentryform': {
                    templateUrl: 'templates/add-new-template.html',
                    controller: 'NewLiftCtrl',
                    controllerAs: 'add'
                }
            },
            templateUrl: 'templates/profile-template.html',
            controller: 'ProfileCtrl',
            controllerAs: 'prof',
            resolve: {
                specRecords: ['records', '$stateParams', function(records, $stateParams){
                    return records.getMine($stateParams.username);
                    // return records.getAll();
                }],
                specUser: ['userdata', '$stateParams', function(userdata, $stateParams){
                    return userdata.getInfo($stateParams.username);
                }]
            }
        })
        .state('profiles.add', {
            templateUrl: 'templates/add-new-template.html',
            controller: 'NewLiftCtrl',
            controllerAs: 'add'
        });
        
        
    $urlRouterProvider.otherwise('home');
    
    }]);