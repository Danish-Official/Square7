import React from "react";
import "./PlotLayout2.scss";

const PlotLayout2 = () => {
  return (
    <div className="plotLayout2Wrapper">
      <div className="highway">45.00 M wide state Highway</div>
      <div className="actualLayout">
        <div className="upperLayout">
          <div>12.00 M wide road</div>
          <div>9.00 M wide road</div>
          <div className="leftPlots">
            <div className="plot23to27">
              <div className="plot plot23">23</div>
              <div className="plot plot24">24</div>
              <div className="plot plot25">25</div>
              <div className="plot plot26">26</div>
              <div className="plot plot27">27</div>
            </div>
            <div className="plot13to22">
              <div className="plot plot13">13</div>
              <div className="plot plot14">14</div>
              <div className="plot plot15">15</div>
              <div className="plot plot16">16</div>
              <div className="plot plot17">17</div>
              <div className="plot plot18">18</div>
              <div className="plot plot19">19</div>
              <div className="plot plot20">20</div>
              <div className="plot plot21">21</div>
              <div className="plot plot22">22</div>
            </div>
          </div>
          <div className="">9.00 M wide road</div>
          <div className="rightPlots">
            <div className="plot3to12">
              <div className="plot plot3">3</div>
              <div className="plot plot4">4</div>
              <div className="plot plot5">5</div>
              <div className="plot plot6">6</div>
              <div className="plot plot7">7</div>
              <div className="plot plot8">8</div>
              <div className="plot plot9">9</div>
              <div className="plot plot10">10</div>
              <div className="plot plot11">11</div>
              <div className="plot plot12">12</div>
            </div>
            <div className="plot1-2-amenitySpace">
              <div className="plot plot1">1</div>
              <div className="plot plot2">2</div>
              <div className="amenitySpace">Amenity Space</div>
            </div>
          </div>
        </div>
        <div className="lowerLayout">
          <div>12.00 M wide road</div>
          <div>9.00 M wide road</div>
          <div className="leftPlots">
            <div className="plot28to31">
              <div className="plot plot28">28</div>
              <div className="plot plot29">29</div>
              <div className="plot plot30">30</div>
              <div className="plot plot31">31</div>
            </div>
            <div className="plot31to40">
              <div className="plot plot32">31</div>
              <div className="plot plot32">32</div>
              <div className="plot plot33">33</div>
              <div className="plot plot34">34</div>
              <div className="plot plot35">35</div>
              <div className="plot plot36">36</div>
              <div className="plot plot37">37</div>
              <div className="plot plot38">38</div>
              <div className="plot plot39">39</div>
              <div className="plot plot40">40</div>
            </div>
          </div>
          <div className="">9.00 M wide road</div>
          <div className="rightPlots">
            <div className="plot41to48">
              <div className="plot plot41">41</div>
              <div className="plot plot42">42</div>
              <div className="plot plot43">43</div>
              <div className="plot plot44">44</div>
              <div className="plot plot45">45</div>
              <div className="plot plot46">46</div>
              <div className="plot plot47">47</div>
              <div className="plot plot48">48</div>
            </div>
            <div className="plot49to56">
              <div className="plot plot49">49</div>
              <div className="plot plot50">50</div>
              <div className="plot plot51">51</div>
              <div className="plot plot52">52</div>
              <div className="plot plot53">53</div>
              <div className="plot plot54">54</div>
              <div className="plot plot55">55</div>
              <div className="plot plot56">56</div>
            </div>
            <div className="">9.00 M wide road</div>
            <div className="openSpace">Open Space</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotLayout2;
