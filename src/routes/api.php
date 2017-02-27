<?php

use Illuminate\Http\Request;
use App\User;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::resource('user', 'UserController', ['only' => [
    'index', 'show', 'store', 'update',
]]);

Route::resource('app', 'AppController', ['only' => [
    'index', 'show', 'store', 'update',
]]);

Route::resource('station', 'StationController', ['only' => [
    'index', 'show', 'store', 'update', 'destroy'
],
'middleware' => ['permission:manage_station'],
]);
Route::resource('station/{station}/device', 'DeviceController', ['only' => [
    'index', 'show', 'store', 'update', 'destroy'
]]);
Route::resource('station/{station}/device/{device}/data', 'DeviceDataController', ['only' => [
    'index'
]]);
Route::resource('station/{station}/device/{device}/config', 'DeviceConfigController', ['only' => [
    'index', 'show', 'store', 'update'
]]);
Route::resource('station/{station}/alert', 'AlertController', ['only' => [
    'index'
]]);
