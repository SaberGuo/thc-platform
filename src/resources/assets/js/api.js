import defaultOptions from './chartOptions'
import translations from './translations'
function data2lists (device, data) {
    var keys = {};
    _.forIn(data, function(item) {
        var config = item.config ? item.config.data : {};
        _.forIn(item.data, function(value, key) {
            item.data[key] = _.assign(item.data[key], config[key], {
                ts: item.ts
            });
            if (!keys[key]) {
                keys[key] = {data:[],name: device.name + ' - ' + translations[key]};
            }
            keys[key].data.push(item.data[key]);
            keys[key].type = item.data[key].type || 'temp';
        });
    });
    _.each(keys, (v)=> {
        if (v.type == 'image') {
            v.data = _.orderBy(v.data, ['ts'], ['desc']);
        }
    })
    return keys;
};
export default {
    getDeviceData(devices, query, callback) {
        if (!_.isArray(devices)) devices = [devices];
        console.log(devices)
        query = query || {}
        query.with = 'config';
        query.limit = 10000;
        var options = {
            params: query,
        }
        var requests = _.map(devices, function (device) {
            var uri = '/api/station/'+device.station_id+'/device/'+device.id+'/data';
            console.log('requests!');
            return Vue.http.get(uri, options).then(function (res) {
                return _.values(data2lists(device, res.body))
            });
        })
        $.when.apply(null, requests).then(function () {
            // var device = _.find(devices, {id: v.body.items[0]})
            return callback(null, _.concat.apply(null, arguments));
        })

    },
    data2charts (data) {
        var self = this;
        var charts = {};
        _.forIn(data, function (v) {
            if (v.type == 'image') return;
            var type = v.type;
            charts[type] = charts[type] || _.cloneDeep(defaultOptions[type]);
            var serieData =  _.map(v.data, function (dd) {
                        return [moment(dd.ts).toDate().getTime(), parseFloat(dd.value)];
                    });
            var serie = {
                    name: v.name,
                    data: serieData,
            }
            if (type == 'rainfall') {
                serie.data = self.accumlateByTime(serie.data);
            }
            if (type == 'wind-direction'){
                serie.data = self.averageByTime(serie.data);
                serie.data = _.map(serie.data, function(v){
                  return {
                    x: v[0],
                    y: v[1],
                    marker: { symbol: self.getDirMarker(v[1])},
                    width: 26,
                    height: 26,
                  }
                });
            }
            if (type == 'wind-velocity'){
                serie.data = self.averageByTime(serie.data);

            }
            charts[type].series.push(serie);
        });
        var result = {};
        if(charts['solar-radiation']){
            result['solar-radiation'] = charts['solar-radiation'];
        };
        if(charts['rainfall']){
            result['rainfall'] = charts['rainfall'];
        };
        if(charts['temperature']){
            result['temperature'] = charts['temperature'];
        };
        if(charts['humility']){
            result['humility'] = charts['humility'];
        };
        if(charts['wind-velocity']){
            result['wind-velocity'] = charts['wind-velocity'];
        };
        if(charts['wind-direction']){
            result['wind-direction'] = charts['wind-direction'];
        };
        if(charts['voltage']){
            result['voltage'] = charts['voltage'];
        };
        result = _.assign(result, charts);
        // return JSON.parse(JSON.stringify(charts));
        return JSON.parse(JSON.stringify(result));
    },
    accumlateByTime (data) {
        var res = _.reduce(data, function (result, v, k) {
            var t = moment(v[0]).format("YYYY-MM-DD HH:00:00");
            result[t] = result[t] || 0;
            result[t] += v[1];
            return result;
        }, {});
        return _.map(res, function (v,k) {return [moment(k).toDate().getTime(),v]});
    },
    averageByTime(data){
      var res = _.reduce(data, function (result, v, k) {
          var t = moment(v[0]).format("YYYY-MM-DD HH:00:00");
          result[t] = result[t] || [0,0];
          result[t][0] += v[1];
          result[t][1] += 1;
          return result;
      }, {});
      return _.map(res, function(v,k){ return [new Date(k).getTime(), v[0]/v[1]]});
    },
    getDirMarker(v){
      var self = this;
      return self.getMarkers()[Math.floor(v/22.5)];
    },
    getMarkers(){
      return ['url(/image/north.png)',
      'url(/image/east_north.png)',
      'url(/image/east_north.png)',
      'url(/image/east.png)',
      'url(/image/east.png)',
      'url(/image/east_south.png)',
      'url(/image/east_south.png)',
      'url(/image/south.png)',
      'url(/image/south.png)',
      'url(/image/west_south.png)',
      'url(/image/west_south.png)',
      'url(/image/west.png)',
      'url(/image/west.png)',
      'url(/image/west_north.png)',
      'url(/image/west_north.png)',
      'url(/image/north.png)',
      ]
    },
    formatData(items, config) {
        var data = {};
        items.forEach(function(v) {
            _.forIn(v.data, function(value, key) {
                data[key] = data[key] || [];
                data[key].push([moment(v.ts).toDate().getTime(), value.value]);
            })
        })
        return _.map(data, function(v, k) {
            return {
                name: k,
                data: v,
                _type: config.data[k] ? config.data[k].type : null ,
            }
        })
    }

}
