<a href="http://www.github.com">Risk Cloud</a>
===

&nbsp; A desktop web application that's fully client-side, with a single dependency on <a href="https://github.com/mrdoob/three.js/">Three.js</a>. The current build allows users to visualize <a href="https://en.wikipedia.org/wiki/Option_(finance)">options</a> structures with a maximum of four legs and sixth months remaining to expiration using the <a href="https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model">Black-Scholes-Merton model</a>.

&nbsp; Click the corresponding link in the 'MODEL' sub-menu to begin. Select the number of legs in the trade and click the 'Continue' button.

<br>
<img width="" alt="home page" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVM2JoaWkwQ1Zqcms">
<br>
<img width="" alt="BSM page 1" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVaXJ0eDh6WEZtNWM">
<br>

&nbsp; Enter the details of the trade and click 'Calculate' to start loading the structure, or click 'Return' to redefine the number of legs. Time spreads, etc. may be specified via the blue tabs in the first column, which open those parameters for editing in the other columns.

&nbsp; <i>The parameters for the trade below reflect data from April 3rd, 2017 for the monthly SPX options expiring June 16th, 2017. They are provided for demonstration purposes only and do not constitute a recommendation.</i>

<br>
<img width="" alt="BSM page 2" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVZU9DMHR6ZkUtQXc">
<br>

&nbsp; The visual presentation of trades was inspired by the <a href="https://www.thinkorswim.com/t/trading.html">ThinkorSwim desktop</a> platform. Users familiar with that software will recognize similarities in both the graph as well as the mouse tracker and its output.

&nbsp; The yellow vertical dotted lines mark the discrete range from -3 standard deviations to +3, with the <a href="https://en.wikipedia.org/wiki/Moneyness">at-the-money</a> center line being 0. An estimate of <a href="https://en.wikipedia.org/wiki/Implied_volatility">implied volatility</a> derived from trade parameters is used as a proxy for <a href="https://en.wikipedia.org/wiki/Standard_deviation">standard deviation</a>.

&nbsp; The table below the graph offers a snapshot of the trade, which assumes the underlying will close the day at the current price.

<br>
<img width="" alt="BSM page 3 profit" src="https://drive.google.com/uc?export=download&id=0B3rehuqgDPeVcTFObFluQVFLbzQ">
<br>

&nbsp; In addition to P&L, eight <a href="https://en.wikipedia.org/wiki/Greeks_(finance)">greeks</a> are supported by the application.

<br>
<img width="" alt="BSM page 3 delta" src="https://drive.google.com/uc?export=download&id=">
<br>

&nbsp; <i>Note that in the images above, the site is being accessed locally. In addition to a live version, users can opt to <a href="https://github.com/Ice101781/risk_cloud/archive/master.zip">download</a> the app for use offline.</i>

