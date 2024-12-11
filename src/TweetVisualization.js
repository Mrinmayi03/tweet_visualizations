import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const TweetVisualization = ({ data }) => {
    const svgRef = useRef();
    const [colorScheme, setColorScheme] = useState("sentiment");
    const [selectedTweets, setSelectedTweets] = useState([]);
    const width = 2000; // Width of the SVG canvas
    const height = 900; // Increased height for better vertical separation
    const margin = { top: 100, right: 20, bottom: 50, left: 250 }; // Increased top margin for dropdown

    useEffect(() => {
        if (!data || data.length === 0) return;

        const sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
        const subjectivityColorScale = d3.scaleLinear().domain([0, 1]).range(["#ECECEC", "#4467C4"]);

        const getColorScale = () => colorScheme === "sentiment" ? sentimentColorScale : subjectivityColorScale;

        // Remove any existing SVG content
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

        const months = ["March", "April", "May"];

        // Y position for each month (rows)
        const yScale = d3.scaleBand().domain(months).range([margin.top, height - margin.bottom]).padding(0.5); // Increased padding for better vertical separation

        // Create force simulation
        months.forEach((month) => {
            const monthData = data.filter(d => d.Month === month);

            // X position scale for each tweet within a month
            const xScale = d3.scaleLinear().domain([0, monthData.length]).range([margin.left + 100, width - margin.right - 300]); // Adjusted to increase horizontal distance

            const simulation = d3.forceSimulation(monthData)
                .force("x", d3.forceX((d, i) => xScale(i)).strength(1))
                .force("y", d3.forceY(yScale(month) + yScale.bandwidth() / 2).strength(1))
                .force("collision", d3.forceCollide(8)) // Increase collision radius to separate circles
                .stop();

            // Run simulation
            for (let i = 0; i < 300; i++) simulation.tick();

            // Draw circles
            svg.selectAll(`.circle-${month}`)
                .data(monthData)
                .enter()
                .append("circle")
                .attr("class", `circle-${month}`)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 8)
                .attr("fill", d => getColorScale()(d.Sentiment))
                .attr("opacity", 0.7)
                .attr("stroke", d => selectedTweets.some(tweet => tweet.id === d.id) ? "black" : "none")
                .attr("stroke-width", d => selectedTweets.some(tweet => tweet.id === d.id) ? 2 : 0)
                .on("click", function (event, d) {
                    const isSelected = selectedTweets.some(tweet => tweet.id === d.id);
                    if (isSelected) {
                        setSelectedTweets(selectedTweets.filter(tweet => tweet.id !== d.id));
                    } else {
                        setSelectedTweets([{ id: d.id, text: d.Text }, ...selectedTweets]);
                    }
                });
        });

        // Add month labels
        svg.selectAll(".month-label")
            .data(months)
            .enter()
            .append("text")
            .attr("class", "month-label")
            .attr("x", margin.left / 2)
            .attr("y", d => yScale(d) + yScale.bandwidth() / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(d => d);

        // Add legend
        const legendHeight = 200;
        const legendWidth = 20;

        const legend = svg.append("g")
            .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

        const legendGradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        const updateLegend = (scheme) => {
            legendGradient.selectAll("stop").remove();

            if (scheme === "sentiment") {
                legendGradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", "red")
                    .attr("stop-opacity", 1);

                legendGradient.append("stop")
                    .attr("offset", "50%")
                    .attr("stop-color", "#ECECEC")
                    .attr("stop-opacity", 1);

                legendGradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "green")
                    .attr("stop-opacity", 1);
            } else {
                legendGradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", "#ECECEC")
                    .attr("stop-opacity", 1);

                legendGradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "#4467C4")
                    .attr("stop-opacity", 1);
            }
        };

        updateLegend(colorScheme);

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");

        // Add legend labels
        const addLegendLabels = (scheme) => {
            legend.selectAll("text").remove();

            if (scheme === "sentiment") {
                legend.append("text")
                    .attr("x", legendWidth + 5)
                    .attr("y", legendHeight)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "start")
                    .text("negative");

                legend.append("text")
                    .attr("x", legendWidth + 5)
                    .attr("y", 0)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "start")
                    .text("positive");
            } else {
                legend.append("text")
                    .attr("x", legendWidth + 5)
                    .attr("y", legendHeight)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "start")
                    .text("objective");

                legend.append("text")
                    .attr("x", legendWidth + 5)
                    .attr("y", 0)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "start")
                    .text("subjective");
            }
        };

        addLegendLabels(colorScheme);

        // Update colors on color scheme change
        d3.select('#colorScheme').on('change', function () {
            const selectedScheme = d3.select(this).property('value');
            setColorScheme(selectedScheme);
            svg.selectAll('circle').attr('fill', d => getColorScale()(d.Sentiment));
            updateLegend(selectedScheme);
            addLegendLabels(selectedScheme);
        });

    }, [data, colorScheme]);

    useEffect(() => {
        // Update circle stroke attributes based on selected tweets
        d3.select(svgRef.current).selectAll("circle")
            .attr("stroke", d => selectedTweets.some(tweet => tweet.id === d.id) ? "black" : "none")
            .attr("stroke-width", d => selectedTweets.some(tweet => tweet.id === d.id) ? 2 : 0);
    }, [selectedTweets]);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "left", alignItems: "center", marginBottom: "10px" , marginLeft: "150px"}}>
                <label style={{ marginRight: "10px" }}>Color Box:</label>
                <select id="colorScheme" value={colorScheme} onChange={e => setColorScheme(e.target.value)}>
                    <option value="sentiment">Sentiment</option>
                    <option value="subjectivity">Subjectivity</option>
                </select>
            </div>
            <svg ref={svgRef}></svg>
            <div>
                {selectedTweets.map((tweet) => (
                    <div key={tweet.id} style={{ border: "1px solid black", margin: "5px", padding: "5px" }}>
                        <p>{tweet.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TweetVisualization;
