### About

This is a XBL 2 implementation in JavaScript. Besides the [http://www.w3.org/TR/xbl/](XBL 2.0) language, it also contains the [http://www.w3.org/TR/selectors-api/](Selectors API) implementation with support for [http://www.w3.org/TR/css3-selectors/](CSS 3 Selectors) as well as [http://www.w3.org/TR/becss/](Behavioral Extensions to CSS), [http://www.w3.org/TR/DOM-Level-3-Events/](Document Object Model (DOM) Level 3 Events) and [http://www.w3.org/TR/xmlbase/](XML Base).

```html
<head>
    ...
        <script type="text/javascript" src="xbl.js"></script>
    ...
        <style type="text/css">
            #myid div.myclass > p {
                binding: url('mydocument.xml#mybinding');
            }
        </style>
    ...
</head>
```

### Specifications
* [http://www.w3.org/TR/xbl/](XML Binding Language (XBL) 2.0)
* [http://www.w3.org/TR/xbl-primer/](XBL 2.0 Primer: An Introduction for Developers)
* [http://www.w3.org/TR/becss/](Behavioral Extensions to CSS)