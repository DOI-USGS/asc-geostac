(function() {

class Point{
   constructor(x_coord, y_coord){
         this.x = x_coord;
         this.y = y_coord;
   }
}

class LineSegment{
   constructor(point_1, point_2){
         this.start_point = point_1;
         this.end_point = point_2;
         this.segment_distance = this.get_segment_distance(this.start_point, this.end_point);
   }
   get_line_mid_point(){
         let mid_point = new Point;

         mid_point.x = (this.start_point.x + this.end_point.x) / 2;
         mid_point.y = (this.start_point.y + this.end_point.y) / 2;

         return mid_point
   }
   get_segment_distance(){
         return Math.sqrt( Math.pow(this.end_point.x - this.start_point.x, 2) + Math.pow(this.end_point.y - this.start_point.y, 2) );
   }
}

// default Path style applied if nothing matches
var defaultStyle = {
   stroke: true,
   color: "#03f",
   weight: 5,
   opacity: 1,
   fillOpacity: 1,
   fillColor: '#03f',
   strokeOpacity: 1,
   strokeWidth: 1,
   strokeDashstyle: "solid",
   size: 3,
   dashArray: null,
   lineJoin: null,
   lineCap: null,
};

// attributes converted to numeric values
var numericAttributes = ['weight', 'opacity', 'fillOpacity', 'strokeOpacity', 'size', 'rotation'];

// mapping between SLD attribute names and SVG names
var attributeNameMapping = {
   'stroke': 'color',
   'stroke-width': 'weight',
   'stroke-opacity': 'opacity',
   'fill-opacity': 'fillOpacity',
   'fill': 'fillColor',
   'stroke-opacity': 'strokeOpacity',
   'stroke-dasharray': 'dashArray',
   //strokeDashstyle,
   'stroke-linejoin': 'lineJoin',
   'stroke-linecap': 'lineCap',
   // a bit special for pointsymboler, marker
   'size': 'size',
   'rotation': 'rotation',
   'wellknownname': 'wellKnownName'
};

// mapping SLD operators to shortforms
var comparisionOperatorMapping = {
   'ogc:PropertyIsEqualTo': '==',
   'ogc:PropertyIsNotEqualTo': '!=',
   'ogc:PropertyIsLessThan': '<',
   'ogc:PropertyIsGreaterThan': '>',
   'ogc:PropertyIsLessThanOrEqualTo': '<=',
   'ogc:PropertyIsGreaterThanOrEqualTo': '>=',
   //'ogc:PropertyIsNull': 'isNull',
   //'ogc:PropertyIsBetween'
   // ogc:PropertyIsLike
};

// namespaces for Tag lookup in XML
var namespaceMapping = {
   se: 'http://www.opengis.net/se',
   ogc: 'http://www.opengis.net/ogc',
   sld: 'http://www.opengis.net/sld'
};

function getTagNameArray(element, tagName, childrens) {
   var tagParts = tagName.split(':');
   var ns = null;
   var tags;

   if (tagParts.length == 2) {
      ns = tagParts[0];
      tagName = tagParts[1];
   }

   if(typeof(childrens) !== 'undefined' && childrens) {
      tags = [].filter.call(
         element.children,
         function(element) {
            return element.tagName === ns + ':' + tagName
         }
      )
   } else
      tags = [].slice.call(element.getElementsByTagNameNS(
         namespaceMapping[ns],
         tagName
      ));

   if(!tags.length && ns === 'se')
      return getTagNameArray(element, 'sld:' + tagName, childrens);
   else
      return tags;
};

/**
 * SLD Styler. Reads SLD 1.1.0.
 *
 */
L.SLDStyler = L.Class.extend({
   options: {
      unmatchedStyle: {
         color: false,
         fill: false
      }
   },
   initialize: function(sldStringOrXml, options) {
      this.symbols = [];
      L.Util.setOptions(this, options);
      if (sldStringOrXml !== undefined) {
         this.featureTypeStylesNameMap = {};
         this.featureTypeStyles = this.parse(sldStringOrXml);
      }
   },
   

   // translates PolygonSymbolizer attributes into Path attributes
   parseSymbolizer: function(symbolizer) {
      // SvgParameter names below se:Fill and se:Stroke
      // are unique so don't bother parsing them seperatly.
      var parameters = getTagNameArray(symbolizer, 'se:SvgParameter');
      var cssParams = L.extend({}, defaultStyle);

      if(!parameters.length) {
         parameters = getTagNameArray(symbolizer, 'se:CssParameter');
      }

      parameters.forEach(function(param) {
         var key = param.getAttribute('name');
         var mappedKey = attributeNameMapping[key];
         if (false == (mappedKey in cssParams)) {
            console.error("Ignorning unknown SvgParameter name", key);
         } else {
            var value = param.textContent;
            if (numericAttributes.indexOf(mappedKey) > -1) {
               value = parseFloat(value, 10);
            } else if (mappedKey === 'dashArray') {
               value = value.split(' ').join(', ');
            }
            cssParams[mappedKey] = value;
         }
      });
      // invididual tags fro pointsymbolizer which is a bit special
      ['Size', 'WellKnownName', 'Rotation'].forEach(tagName => {
         const tags = getTagNameArray(symbolizer, 'se:' + tagName);
         if (tags.length) {
            const cssName = tagName.toLowerCase();
            const mappedKey = attributeNameMapping[cssName];
            let value = tags[0].textContent;
            if (numericAttributes.indexOf(cssName) > -1) {
               value = parseFloat(value, 10);
            }
            cssParams[mappedKey] = value;
         }
      })
      const sizeTags = getTagNameArray(symbolizer, 'se:Size');
      if (sizeTags.length) {
      }
      const wellKnownNameTags = getTagNameArray(symbolizer, 'se:WellKnownName');
      if (wellKnownNameTags.length) {
         cssParams[attributeNameMapping['wellknown']]
      }
      return cssParams;
   },
   parseFilter: function(filter) {
      if(filter) {
         var hasAnd = getTagNameArray(filter, 'ogc:And').length;
         var hasOr = getTagNameArray(filter, 'ogc:Or').length;
         var filterJson = {
            operator: hasAnd == true ? 'and' : hasOr ?  'or' : null,
            comparisions: []
         };
         Object.keys(comparisionOperatorMapping).forEach(function(key) {
            var comparisionElements = getTagNameArray(filter, key);
            var comparisionOperator = comparisionOperatorMapping[key];
            comparisionElements.forEach(function(comparisionElement) {
               var property = getTagNameArray(comparisionElement, 'ogc:PropertyName')[0].textContent;
               var literal = getTagNameArray(comparisionElement, 'ogc:Literal')[0].textContent;
               filterJson.comparisions.push({
                  operator: comparisionOperator,
                  property: property,
                  literal: literal
               })
            })
         });
         return filterJson;
      }
   },
   parseRule: function(rule) {
      var filter = getTagNameArray(rule, 'ogc:Filter')[0];
      var polygonSymbolizer = getTagNameArray(rule, 'se:PolygonSymbolizer')[0];
      var lineSymbolizer = getTagNameArray(rule, 'se:LineSymbolizer')[0];
      var pointSymbolizer = getTagNameArray(rule, 'se:PointSymbolizer')[0];
      return {
         filter: this.parseFilter(filter),
         polygonSymbolizer: polygonSymbolizer ? this.parseSymbolizer(polygonSymbolizer) : null,
         lineSymbolizer: lineSymbolizer ? this.parseSymbolizer(lineSymbolizer) : null,
         pointSymbolizer: pointSymbolizer ? this.parseSymbolizer(pointSymbolizer) : null
      }
   },
   parse: function(sldStringOrXml) {
      var xmlDoc = sldStringOrXml;
      var self = this;

      if (typeof(sldStringOrXml) === 'string') {
         var parser = new DOMParser();
         xmlDoc = parser.parseFromString(sldStringOrXml, "text/xml");
      }
      var featureTypeStyles = getTagNameArray(xmlDoc, 'se:FeatureTypeStyle');
      window.xmlDoc = xmlDoc;

      featureTypeStyles.forEach(function(element, idx) {
         var layerName = getTagNameArray(
            element.parentElement.parentElement,
            'se:Name',
            true
         ).map(function (node) {
            return node.innerHTML;
         });

         if(layerName.length) {
            self.featureTypeStylesNameMap[layerName] = idx;
         }
      });

      return featureTypeStyles.map(function(featureTypeStyle) {
         var rules = getTagNameArray(featureTypeStyle, 'se:Rule');
         var name = getTagNameArray(
               featureTypeStyle.parentElement,
               'se:Name',
               true
            ).map(function(node) {
               return node.innerHTML;
            });

         if(!name.length)
            name = null;
         else
            name = name[0];

         return {
            'name' : name,
            'rules': rules.map(function(rule) {
               return this.parseRule(rule);
            }, this)
         };
      }, this);
   },
   isFilterMatch: function(filter, properties) {
      if (filter) {
         var operator = filter.operator == null || filter.operator == 'and' ? 'every' : 'some';
         return filter.comparisions[operator](function(comp) {
            if (comp.operator == '==') {
               return properties[comp.property] == comp.literal;
            } else if (comp.operator == '!=') {
               return properties[comp.property] != comp.literal;
            } else if (comp.operator == '<') {
               return properties[comp.property] < comp.literal;
            } else if (comp.operator == '>') {
               return properties[comp.property] > comp.literal;
            } else if (comp.operator == '<=') {
               return properties[comp.property] <= comp.literal;
            } else if (comp.operator == '>=') {
               return properties[comp.property] >= comp.literal;
            } else {
               console.error('Unknown comparision operator', comp.operator);
            }
         });
      } else
         return true;
   },
   matchFn: function (featureTypeStyle, feature) {
      var matchingRule = null;

      featureTypeStyle.rules.some(function (rule) {
         if (this.isFilterMatch(rule.filter, feature.properties)) {
            matchingRule = rule;
            return true;
         }
      }, this);

      return matchingRule;
   },
   styleFn: function (indexOrName, feature) {
      var matchingRule = null;

      if (typeof (indexOrName) !== 'undefined') {
         if (
            typeof (indexOrName) === "string" &&
            indexOrName in this.featureTypeStylesNameMap
         ) {
            indexOrName = this.featureTypeStylesNameMap[indexOrName];
         } else {
            console.error("Unknown layer style '" + indexOrName + "'.")
            return {};
         }

         if(indexOrName in this.featureTypeStyles) {
            matchingRule = this.matchFn(
               this.featureTypeStyles[indexOrName],
               feature
            )
         } else {
            console.error("Unkonwn style index " + indexOrName)
            return {}
         }
      } else
         this.featureTypeStyles.some(function (featureTypeStyle) {
            matchingRule = this.matchFn(featureTypeStyle, feature)
         }, this);

      if (matchingRule != null) {
         switch (feature.geometry.type) {
            case 'LineString':
            case 'MultiLineString':
               return matchingRule.lineSymbolizer;
            case 'Polygon':
            case 'MultiPolygon':
               return matchingRule.polygonSymbolizer;
            case 'Point':
               return matchingRule.pointSymbolizer;
         }
         return this.options.unmatchedStyle;
      }

      return {};
   },
   pointToLayerFunction: function(indexOrName, feature, latlng) {
      var styling = this.styleFn(indexOrName, feature);
      return L.circleMarker(latlng, {
         radius: styling.size || 1,
         interactive: false
      });
   },
   getStyleFunction: function (indexOrName) {
      return this.styleFn.bind(this, indexOrName);
   },
   getPointToLayerFunction: function(indexOrName) {
      return this.pointToLayerFunction.bind(this, indexOrName);
   },

   find_symbol: function( svgRequest ) {
      // Declare variable to hold svg contents
      var svgText;

      // Dynamically load modules of svgs in plaintext
      const svgFiles = require.context(
         '!url-loader?encoding=ascii!./images/FGDC_svgs/', true, /\.svg$/
      );
      
      // Loop through loaded files
      svgFiles.keys().forEach( (svgKey) => {
      
         // Check if key matches requested svg name
         if( svgKey.split("/").pop() == svgRequest )
         {
            // Assign value of svg module
            svgText = svgFiles(svgKey);
         }
      })

      // Return contents of svg
      return svgText.default;
   },

   symbolize_with_icons: function(geolayer, map){
      let layer = null;
      let symbol = null;

      for (var i in geolayer._layers){
          layer = geolayer._layers[i]

          if(layer.feature.geometry.type != null){
            // symbol = find_symbol();

            if (layer.feature.geometry.type == "LineString"){
            this.symbolize_line(layer.feature.geometry, map, symbol);
        } else if ((layer.feature.geometry.type == "Polygon")){
            this.symbolize_polygon(layer.feature.geometry, map, symbol);
        }}

      }
  },
   symbolize_line: function(geometry, map, symbol){
   let total_line_length = 0;
   let point_arr = [];
   let mid_point_distance = 0;
   let line_segment = null;
   let distance_from_endpoint_to_midpoint = 0;
   let g = 0;
   let mid_point = null;

   point_arr = this.create_arr_of_line_segments(geometry);

   total_line_length = this.get_total_line_length(point_arr);
   mid_point_distance = total_line_length / 2;
   line_segment = this.find_line_segment(mid_point_distance, point_arr);
   distance_from_endpoint_to_midpoint = this.get_distance_from_line_endpoint_to_midpoint(line_segment, mid_point_distance, point_arr);
   g = line_segment.get_segment_distance() - distance_from_endpoint_to_midpoint;

   mid_point = this.get_mid_point( line_segment.start_point, line_segment.end_point, 
                                  g, line_segment.get_segment_distance());

   this.add_symbol(mid_point, map, symbol);
   },
   symbolize_polygon: function(geometry, map){

      let point_1 = null;
      let point_2 = null;
      let line_segment = null;
      let mid_point = null;

      // for each coordinate 
      for (let i = 0; i < geometry.coordinates[0].length - 1; i++){

         point_1 = new Point(geometry.coordinates[0][i][0], geometry.coordinates[0][i][1])
         point_2 = new Point(geometry.coordinates[0][i + 1][0], geometry.coordinates[0][i + 1][1])
         line_segment = new LineSegment(point_1, point_2);

         mid_point = line_segment.get_line_mid_point();

         this.add_symbol(mid_point, map);
      }
   },
   create_arr_of_line_segments: function(geometry){
      let line_segment = null;
      let point_arr = [];
      let amount_of_vectors = geometry.coordinates.length - 1;

      for (let i = 0; i < amount_of_vectors; i++){
         current_point = geometry.coordinates[i];
         next_point = geometry.coordinates[i+1];
         line_segment = this.create_line_segment_object(current_point, next_point );
         point_arr[i] = line_segment;
      }
      return point_arr;
   },
   get_total_line_length: function(point_arr){
      let total_line_distance = 0;

      for (let i = 0; i < point_arr.length; i++){
         total_line_distance += point_arr[i].get_segment_distance();
      }
      return total_line_distance;
   },
   find_line_segment: function( mid_point_distance, point_arr){

      let current_line_distance = 0;

      for (let i = 0; i < point_arr.length; i++){  
         current_line_distance += point_arr[i].get_segment_distance()

         if( mid_point_distance < current_line_distance ){
            return point_arr[i];
         }
      }
   },
   get_distance_from_line_endpoint_to_midpoint: function(line_segment, mid_point_distance, point_arr){
      let current_line_distance = 0;

      for (let i = 0; i < point_arr.length; i++){
         current_line_distance += point_arr[i].get_segment_distance();

         if (line_segment == point_arr[i])
         {
            return current_line_distance - mid_point_distance;
         }
      }
   },
   get_mid_point: function(point_1, point_2, g, line_length){
      let x = 0;
      let y = 0;
      let mid_point = null;

      x = (point_1.x + (g/line_length) * (point_2.x - point_1.x));
      y = (point_1.y + (g/line_length) * (point_2.y - point_1.y));

      mid_point = new Point(x, y);

      return mid_point;
   },
   create_line_segment_object: function(point_a, point_b){
      let current_point = null;
      let next_point = null;
      let line_segment = null;

      current_point = new Point(point_a[0], point_a[1])
      next_point = new Point(point_b[0], point_b[1])
      line_segment = new LineSegment(current_point, next_point)

      return line_segment;
   },
   add_symbol: function(point, map, symbol){
      var svgElementBounds = null;
      var svgElement = null;

      svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
      svgElement.innerHTML = this.find_symbol('strike_slip_fault_arrows_r.svg');
      svgElementBounds = [ [ point.y - 0.05, point.x + 0.05 ], [ point.y , point.x ] ];
      
      const addedSymbol = L.svgOverlay(svgElement, svgElementBounds).addTo(map);
      this.symbols.push(addedSymbol);
   },
   remove_symbols: function(map){
      for (var i = 0; i < this.symbols.length; i++) {
         this.symbols[i].removeFrom(map);
      }
      this.symbols = [];
   }
});

L.SLDStyler.defaultStyle = defaultStyle;

})();