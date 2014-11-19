angular.module('grisu-noe').controller('incidentsListController',
    function($scope, $state, $stateParams, dataService, $ionicNavBarDelegate, util, $window) {

    $scope.doRefresh = function() {
        util.showLoadingDelayed();
        $scope.isRefreshing = true;

        dataService.getMainData(true).then(function(data) {
            angular.forEach(data.Bezirke, function(district) {
                if (district.k == $stateParams.id) {
                    $ionicNavBarDelegate.setTitle(district.t);
                }
            });

            if (!$ionicNavBarDelegate.getTitle().length) {
                $ionicNavBarDelegate.setTitle('Einsätze von Bezirk');
            }
        });

        dataService.getActiveIncidents($stateParams.id).then(function(data) {
            $scope.incidents = data.Einsatz;
        }, function(code) {
            util.showLoadingErrorDialog(code);
        }).finally(function() {
            $scope.isRefreshing = false;
            $scope.$broadcast('scroll.refreshComplete');
            util.hideLoading();
        });
    };

    $scope.goToIncident = function(incidentId) {
        if ($window.location.hash.indexOf('overview-incidents') > -1) {
            $state.go('tabs.overview-incident', { id: incidentId });
        } else if ($window.location.hash.indexOf('district-incidents') > -1) {
            $state.go('tabs.districts-incident', { id: incidentId });
        } else {
            console.error('Wrong window location hash set', $window.location.hash);
        }
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh();
    });

    $scope.doRefresh();
});