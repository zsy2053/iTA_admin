'use strict';

var controllers = angular.module('controllers', []);

controllers.controller('UploadController',['$scope', function($scope) {
  $scope.sizeLimit      = 5e+8; // 10MB in Bytes
  $scope.uploadProgress = 0;
  $scope.creds          = {};
  $scope.datas          = [];
  AWS.config.update({ accessKeyId: "AKIAJPED5IVPCCFWUM6A", secretAccessKey: "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" });
  AWS.config.region = 'us-east-1';
  var bucket = new AWS.S3({ params: { Bucket: "itavideo" } });

  $scope.delete = function(key) {
    bucket.deleteObject({
      Key: key
    }, function(err, data) {
      if (err) console.log(err, err)
      loadData()
    })
  }

  const loadData = function() {
    bucket.listObjects(function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        $scope.datas = data.Contents
        $scope.$apply()
      }
    })
  }

  $scope.upload = function() {
    if($scope.file) {
        // Perform File Size Check First
        var fileSize = Math.round(parseInt($scope.file.size));
        if (fileSize > $scope.sizeLimit) {
          toastr.error('Sorry, your attachment is too big. <br/> Maximum '  + $scope.fileSizeLabel() + ' file attachment allowed','File Too Large');
          return false;
        }
        // Prepend Unique String To Prevent Overwrites
        var uniqueFileName = $scope.uniqueString() + '-' + $scope.file.name;

        var params = { Key: uniqueFileName, ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };

        bucket.putObject(params, function(err, data) {
          if(err) {
            toastr.error(err.message,err.code);
            return false;
          }
          else {
            // Upload Successfully Finished
            toastr.success('File Uploaded Successfully', 'Done');
            loadData()
            // Reset The Progress Bar
            setTimeout(function() {
              $scope.uploadProgress = 0;
              $scope.$digest();
            }, 4000);
          }
        })
        .on('httpUploadProgress',function(progress) {
          $scope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
          $scope.$digest();
        });
      }
      else {
        // No File Selected
        toastr.error('Please select a file to upload');
      }
    }

    $scope.fileSizeLabel = function() {
    // Convert Bytes To MB
    return Math.round($scope.sizeLimit / 1024 / 1024) + 'MB';
  };

  $scope.uniqueString = function() {
    const res = new Date();
    return res.toString();
  }

  loadData()

}]);
