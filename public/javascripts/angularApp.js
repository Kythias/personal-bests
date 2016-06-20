var app = angular.module('personalBest', [
    'ui.router',
    'ui.bootstrap'
    ]);

app.factory('records', ['$http', 'auth', function($http, auth){
    var o = {
        bests: [],
        liftList: [
            {name: 'Clean'},
            {name: 'Clean & Jerk'},
            {name: 'Push Press'},
            {name: 'Strict Press'},
            {name: 'Deadlift'},
            {name: 'Snatch'},
            {name: 'Front Squat'},
            {name: 'Back Squat'},
            {name: 'Overhead Squat'},
            {name: 'Thuster'}
            ]
    };
    
    o.getAll = function() {
        return $http.get('/bests').success(function(data){
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

app.controller('MainCtrl', ['records', function(records){
    
    var self = this;
    
    self.lifts = records.bests;
    
    self.remove = function(id, index){
        records.remove(id, index);
    };
    
    
    
    
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
            self.logOut = auth.logOut;
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
                'newentryform': {
                    templateUrl: 'templates/add-new-template.html',
                    controller: 'NewLiftCtrl',
                    controllerAs: 'add'
                }
        },
            resolve: {
                postPromise: ['records', function(records){
                    return records.getAll();
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
        });
        
    $urlRouterProvider.otherwise('/home');
    
    }]);