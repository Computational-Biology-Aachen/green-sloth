The Farquhar, von Caemmerer, and Berry model is a widely used model to calculate steady-state carbon assimilation ($A$) rates in plants. It was first developed in 1980 and has since gained massive popularity and been modified and used in other models of plant photosynthesis. It can be argued that it is the most important model of photosynthesis, even if it is only built on algebraic functions. It uses the assumption that the carbon assimilation rate is dependent on only two, later three, rates. The RuBisCO limited rate ($W_\mathrm{c}$), the electron transport limited rate ($W_\mathrm{j}$), and the triphosphate limited rate ($W_\mathrm{p}$).

Since this model has seen widespread use, a variant that includes translation errors, the min-A variant, has emerged. This variant first calculates three distinct carbon assimilations, each including the three limiting rates separately. Afterward, it uses the minimum of the calculated limiting rates of carbon assimilation to calculate the final assimilation rate. However, the correct version, the min-W variant, uses the minimum of the limiting rates to replace the carboxylase rate ($V_\mathrm{c}$) in the calculation of $A$. While both variants showcase the same trend in higher partial pressure of $\mathrm{CO_2}$, the min-A deviates from the original model in lower partial pressure [(Lochocki *et al.* 2025)](https://doi.org/10.1093/insilicoplants/diaf014). Therefore, it is recommended to use the min-W variant when showcasing the model from the original work.   

$$
\begin{align*}
    A &= V_\mathrm{c} \cdot \left( \frac{1 - \Gamma ^*}{\mathrm{CO_2}} \right) - R_\mathrm{d}\\

    \text{min-W}:\\

    V_\mathrm{c} &= \min(W_\mathrm{c}, W_\mathrm{j}, W_\mathrm{p})\\
    \Rightarrow A &= \min(W_\mathrm{c}, W_\mathrm{j}, W_\mathrm{p}) \cdot \left( \frac{1 - \Gamma ^*}{\mathrm{CO_2}} \right) - R_\mathrm{d}\\

    \text{min-A}:\\

    A_\mathrm{c} &= W_\mathrm{c} \cdot \left( \frac{1 - \Gamma ^*}{\mathrm{CO_2}} \right) - R_\mathrm{d}\\
    A_\mathrm{j} &= W_\mathrm{j} \cdot \left( \frac{1 - \Gamma ^*}{\mathrm{CO_2}} \right) - R_\mathrm{d}\\
    A_\mathrm{p} &= W_\mathrm{p} \cdot \left( \frac{1 - \Gamma ^*}{\mathrm{CO_2}} \right) - R_\mathrm{d}\\

    \Rightarrow A &= \min(A_\mathrm{c}, A_\mathrm{j}, A_\mathrm{p})\\
\end{align*}
$$