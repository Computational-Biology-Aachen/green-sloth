<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import Contribute from "#lib/features/contribute/Contribute.svelte";
  import IMG_FIT_BUTTON from "#lib/assets/fitting_button.png";
  import IMG_FIT_SETINGS from "#lib/assets/fitting_settings.png";
  import IMG_FIT_DATA from "#lib/assets/fitting_data.png";
  import IMG_FIT_PARAMS from "#lib/assets/fitting_params.png";
  import IMG_FIT_GRAPHS from "#lib/assets/fitting_graphs.png";
  import IMG_FIT_DONE from "#lib/assets/fitting_done.png";
  import IMG_LOCALFIT_FIRST from "#lib/assets/localfitting_testingoutplot.svg";
  import IMG_LOCALFIT_RESULT from "#lib/assets/localfitting_resultplot.svg";
  import {
    H1,
    H2,
    H3,
    Section,
    SectionHeader,
    Text,
    Row,
    Pair,
    Button,
    Ol,
    Li,
    Bold,
    Link,
    Code,
    Pre,
    Accordion,
  } from "@computational-biology-aachen/design";
  import Image from "@computational-biology-aachen/design/Image.svelte";
  const repo = "https://github.com/Computational-Biology-Aachen/green-sloth";
  let section = $state("website");
  $effect(() => {
    const urlSection = page.url.searchParams.get("section");
    if (urlSection) {
      section = urlSection;
      const url = new URL(page.url.href);
      url.searchParams.delete("section");
      goto(url, { replaceState: true, reset: false });
    }
  });
  function setSection(newSection: string) {
    section = newSection;
  }

  const pam_protocol_code = `from mxlpy import make_protocol
import pandas as pd

def PAM_protocol(
    relax_light: float,
    relax_duration: float,
    light: float,
    light_duration: float,
    SP_light: float,
    SP_duration: float,
    dark_duration: float
) -> pd.DataFrame:
    """Creates an MxlPy pam protocol, with a set amount of phases, but controllable light intensities and duration. The phases are:
    1. Actinic light for 73 seconds
    2. 10 reps of high actinic light
    3. 10 reps of low actinic light
    4. 5 reps of dark light

    Args:
        relax_light (float): PPFD value for the low actinic light phase
        relax_duration (float): Duration of the low actinic light phase
        light (float): PPFD value for the high actinic light phase
        light_duration (float): Duration of the high actinic light phase
        SP_light (float): PPFD value for the saturation pulse
        SP_duration (float): Duration of the saturation pulse
        dark_duration (float): Duration of the dark light phase

    Returns:
        pd.DataFrame: An Mxlpy pam protocol
    """    

    protocol = make_protocol(
    [(SP_duration, {"PPFD": SP_light}), (73, {"PPFD": light})] +
    [(SP_duration, {"PPFD": SP_light}), (light_duration, {"PPFD": light})] * 10+
    [(SP_duration, {"PPFD": SP_light}), (relax_duration, {"PPFD": relax_light})] *10 +
    [(SP_duration, {"PPFD": SP_light}), (dark_duration, {"PPFD": 0})] * 5
                             )
    return protocol

pam_protocol = PAM_protocol(
    relax_light=90,
    relax_duration=61,
    light=900,
    light_duration=61,
    SP_light=4000,
    SP_duration=0.8,
    dark_duration=61
)`;

  const npq_code = `import pandas as pd

def calc_pam_vals(
    fluo_result: pd.Series, protocol: pd.DataFrame, pfd_str: str = "PPFD", sat_pulse: float = 2000
) -> tuple[pd.Series, pd.Series]:
    """Calculate PAM values from fluorescence data.

    Use the fluorescence data from a PAM protocol to calculate Fm, NPQ. To find the Fm values, the protocol used for simulation is seperated into ranges between each saturating pulse. Then the maximum fluorescence value within each range is taken as Fm. Thes are then used to calculate NPQ.

    Args:
        fluo_result (pd.Series): Fluorescence data as a pd.Series from mxlpy simulation.
        protocol (pd.DataFrame): PAM protocol used for simulation. Created using make_protocol from mxlpy.
        pfd_str (str): The name of the PPFD parameter in the protocol.
        sat_pulse (float, optional): The threshold for saturating pulse in the protocol. Defaults to 2000.

    Returns:
        tuple[pd.Series, pd.Series]: Fm and NPQ as pd.Series
    """    
    
    peaks = protocol[protocol[pfd_str] >= sat_pulse].copy()
    peaks.index = peaks.index.total_seconds()
    peaks = peaks.reset_index()
    
    Fm = {
        "start": [],
        "end": [],
        "time": [],
        "value": []
    }

    for idx, (time, _) in peaks.iterrows():
        if idx == 0:
            start_time = 0
        else:
            start_time = time - (time - peaks["Timedelta"].iloc[idx - 1]) / 2
            
        if idx == len(peaks) - 1:
            end_time = fluo_result.index[-1]
        else:
            end_time = time + (peaks["Timedelta"].iloc[idx + 1] - time) / 2
            
        Fm["start"].append(start_time)
        Fm["end"].append(end_time)
        Fm_slice = fluo_result.loc[start_time:end_time]
        Fm["time"].append(Fm_slice.idxmax())
        Fm["value"].append(Fm_slice.max())
        
    Fm = pd.DataFrame(Fm).set_index("time")
    Fm = Fm["value"]
    Fm.name = "Flourescence Peaks (Fm)"
    
    # Calculate NPQ
    NPQ = (Fm.iloc[0] - Fm) / Fm if len(Fm) > 0 else pd.Series(dtype=float)
    NPQ.name = "Non-Photochemical Quenching (NPQ)"
    
    return Fm, NPQ`;

  const first_test = `import pandas as pd
import matplotlib.pyplot as plt

data = pd.read_csv("input.csv")

mean = data.mean(axis=1)
std = data.std(axis=1)

s = Simulator(get_matuszynska2016())
s.simulate_protocol(pam_protocol, time_points_per_step=100)
c0,v0 = s.get_result().unwrap_or_err()
Fm0, NPQ0  = calc_pam_vals(c0["Fluo"] / max(c0["Fluo"]), pam_protocol, pfd_str="PPFD", sat_pulse=4000)

fig, ax = plt.subplots(figsize=(7, 4))

ax.plot(data["Time"], data["NPQ"], color="C0", lw=2, label="data")
ax.plot(data["Time"], NPQ0, color="C1", lw=2, label="Matuszynska 2016")

plt.xlabel("Time [s]")
plt.ylabel("NPQ [a.U.]")

plt.xlim(0,1500)
plt.legend(loc="upper right")
plt.tight_layout()`;

  const residual_func = `# Simulate NPQ for a given set of parameters
def simulate_npq(params: dict = get_matuszynska2016().get_parameter_values()):
    m = get_matuszynska2016()
    m.update_parameters(params)
    s = Simulator(m)
    s.simulate_protocol(pam_protocol, time_points_per_step=100)
    c,v = s.get_result().unwrap_or_err()
    Fm, NPQ = calc_pam_vals(c["Fluo"] / max(c["Fluo"]), pam_protocol, pfd_str="PPFD", sat_pulse=4000)
    return np.asarray(NPQ)

# Residual function, incorporates simulate NPQ directly to calculate NPQ for given set of parameters and subtract means from it
def residuals_for_npq(x):
    params = dict(zip(fit_params.keys(), x))
    NPQ = simulate_npq(params)
    
    return NPQ - data["NPQ"]`;

  const fit_params = `# Create a dictionary of parameters to fit, with their initial values and bounds
fit_params = {
    "gamma0": {"start": get_matuszynska2016().get_parameter_values()["gamma0"], "bounds": (1e-3, 1e2)},
    "gamma1": {"start": get_matuszynska2016().get_parameter_values()["gamma1"], "bounds": (1e-3, 1e2)},
    "gamma2": {"start": get_matuszynska2016().get_parameter_values()["gamma2"], "bounds": (1e-3, 1e2)},
    "gamma3": {"start": get_matuszynska2016().get_parameter_values()["gamma3"], "bounds": (1e-3, 1e2)},
    "K_pHSat":    {"start": get_matuszynska2016().get_parameter_values()["K_pHSat"], "bounds": (5.0, 7.0)},
    "K_pHSatLHC": {"start": get_matuszynska2016().get_parameter_values()["K_pHSatLHC"], "bounds": (5.0, 7.0)},
    "k_DV":       {"start": get_matuszynska2016().get_parameter_values()["k_DV"], "bounds": (1e-5, 1)},
    "k_EZ":       {"start": get_matuszynska2016().get_parameter_values()["k_EZ"], "bounds": (1e-6, 1)},
    "k_deprot":   {"start": get_matuszynska2016().get_parameter_values()["k_deprot"], "bounds": (1e-4, 1.0)},
    "k_prot":     {"start": get_matuszynska2016().get_parameter_values()["k_prot"], "bounds": (1e-4, 1.0)},
}

starting_guess = [fit_params[key]["start"] for key in fit_params.keys()]
lower_bounds = [fit_params[key]["bounds"][0] for key in fit_params.keys()]
upper_bounds = [fit_params[key]["bounds"][1] for key in fit_params.keys()]`;

  const fitting_code = `from scipy.optimize import least_squares

res = least_squares(residuals_for_npq, starting_guess, bounds=(lower_bounds, upper_bounds), x_scale="jac", ftol=1e-4, xtol=1e-4, max_nfev=50, verbose=2)
best_fit_params = dict(zip(fit_params.keys(), res.x))`;

  const fit_plot_code = `import pandas as pd
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(7, 4))

ax.plot(data["Time"], data["NPQ"], color="C0", lw=2, label="data", ls="--", marker="o", markersize=5, markerfacecolor="C0", markeredgecolor="C0")
ax.plot(data["Time"], simulate_npq(), color="C1", lw=2, label="Matuszynska 2016 (initial)")
ax.plot(data["Time"], simulate_npq(best_fit_params), color="C2", lw=2, label="Matuszynska 2016 (fitted)")

plt.xlabel("Time [s]")
plt.ylabel("NPQ [a.U.]")

plt.xlim(0,1500)
plt.legend(loc="upper right")
plt.savefig("localfitting_resultplot.svg", bbox_inches="tight", dpi=300)`;

  const folder = `src/lib/models/<slug>/
  model.mxl.json    # the model as data  (or model.sbml, model.ts)
  meta.ts           # meta information about the model
  model.md          # prose description shown on the model page
  scheme.svg        # reaction scheme diagram       (optional)
  figs/             # directory for the validation figures
  validation.*ipynb    # scripts for the validation figures (does not need to be Python)
  curatornotes.md   # notes for the validation      (optional)`;
  const metaTs = `import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";
export const meta: ModelMeta = {
  slug: "<autoryear>",
  title: "<Author> <Year>",
  DOI: "<doi>",
  journal: "<Journal>",
  license: "<License>",
  tags: {
    "Part of Photosynthesis": [<tags>],
    "Model type": [<tags>],
    "Explains data": [<tags>],
    Organism: [<tags>],
    "PMF description": [<tags>],
  },
  analyses: [<analyses>],
  contributors: [
    {
      desc: "Initial implementation",
      date: <date>,
      contributor: <contributor>,
    },
    {
      desc: "Maintenance",
      date: <date>,
      contributor: <contributor>,
    },
  ],
};`;
  const verifyCode = `npm install
npm run validate:models   # schema-validate + smoke-check every model
npm run dev               # open the model page, confirm the analyses run`;
</script>

<svelte:head>
  <title>How To - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <Row justify="between">
    <H1 color="light">How To</H1>
    <Pair justify="end">
      <Button
        variant="inverted"
        class={section === "website" ? "inverted active-tab" : "inverted"}
        onclick={() => setSection("website")}>Website</Button
      >
      <Button
        variant="inverted"
        class={section === "fittodata" ? "inverted active-tab" : "inverted"}
        onclick={() => setSection("fittodata")}>Fit to Data</Button
      >
      <Button
        variant="inverted"
        class={section === "contribute" ? "inverted active-tab" : "inverted"}
        onclick={() => setSection("contribute")}>Contribute</Button
      >
      <Button
        variant="inverted"
        class={section === "submit" ? "inverted active-tab" : "inverted"}
        onclick={() => setSection("submit")}>Submit</Button
      >
    </Pair>
  </Row>
</SectionHeader>

{#if section === "website"}
  <Section
    variant="light"
    width="narrow"
  >
    <H1>1. Find a model</H1>
    <Text>
      Use the website to find a model you are interested in. With the help of
      the tags, the live simulation, and the model comparisons, you should find
      a model that you may want to use for your own research or educational
      purposes.
    </Text>
    <H1>2. Download the model</H1>
    <Text>
      Once a model is chosen, you can download it in several formats. We suggest
      using MxlPy, but if you want to use the model in another programming
      language, you can also download it in SBML format or as a raw Python file.
      Please respect the model's license and the original authors' work.
      GreenSloth is a repository of models and does not own the rights to them.
    </Text>
    <H1>3. Using the MxlPy version</H1>
    <Text>
      We recommend using the MxlPy version of each model, as the Python package
      is great for ODE models. Additionally, the creators of GreenSloth also
      created MxlPy, so most of the models were built using the Python package.
      All the models are barebones ODE models, so they only need the MxlPy
      package to run. Look at the <a
        href="https://cpbl.rwth-aachen.de/MxlPy/latest/"
        target="_blank">MxlPy documentation</a
      > for more information on how to use the package and the models.
    </Text>
  </Section>
{:else if section === "fittodata"}
  <Section
    variant="light"
    width="narrow"
  >
    <Text>
      When using a model, the first step is often fitting the model to
      experimental data. With GreenSloth, there are two main ways to do this:
      one through the website itself and one using your own programming
      knowledge. Fitting is simple in theory, but the experiences can vary
      depending on many factors. These include the model itself, the type of
      data, the data quality, and the fitting algorithm. Even these factors can
      be very complex, so there is sadly no one-size-fits-all solution. This
      section will, however, give you an idea of how to start your fitting
      journey.
    </Text>
    <Accordion title="Fitting on the website">
      <Text>
        The website has a built-in fitting tool, which can be used to fit the
        model to the experimental data you upload. Here is a step-by-step guide
        to using the tool.
      </Text>
      <H2>Choose your model and enter the fitting process</H2>
      <Text>
        Each model has a "Fit" button on its model page that takes you to the
        fitting modal. It is to be noted that the fitting routine on the website
        can only fit to variables provided inside the model itself. Calculations
        done after the fact, like how NPQ is often done, cannot be fitted here.
        For that, you need to fit manually.
      </Text>
      <img
        src={IMG_FIT_BUTTON}
        alt="The live simulation of the Li2021 model, showcasing the 'Fit' button"
      />
      <Text>
        The modal contains a lot of information and lets you change several
        settings for the fitting process. On the left, you can change the
        fitting routine's parameters. From which routine to use to how many
        evaluations to run. You can also choose an ensemble fit, which weights
        the data by percentage and can therefore create several fitting
        routines. On the right, you can upload your own experimental data.
      </Text>
      <img
        src={IMG_FIT_SETINGS}
        alt="The fitting modal with various settings"
      />
      <Text>
        This data needs to be in CSV format, with variable names as columns and
        each row as a data point. Best practice is to match the data variables
        to the names used in the model; however, the website auto-detects the
        names and lets you map them to the corresponding model variables. Once
        these settings are set, the most important part of fitting can now be
        tackled.
      </Text>
      <img
        src={IMG_FIT_DATA}
        alt="The fitting modal with various settings"
      />
      <Text>
        Choosing the right parameters to fit is not only crucial, but also the
        most difficult part of the process. With experience in the system being
        modeled and the model itself, it is easier to bridge the model and the
        data. Knowing which parameters affect which parts of the model, and
        which matter most, is crucial to a successful fit. However, getting
        there is challenging and often requires a lot of trial and error. This
        is where the website truly shines: you can easily change the parameters
        to fit and quickly see how the fitting routine performs. The initial
        guesses for each parameter are provided inside the model itself. Check
        the boxes of the parameters you wish to fit. Afterward, you scroll down
        to find two graphs.
      </Text>
      <img
        src={IMG_FIT_PARAMS}
        alt="The parameters of the to-be fit model"
      />
      <Text>
        These two graphs will represent the fitting process. The first graph
        shows the model's simulation results, while the second shows the
        residual norm for each evaluation. Right now, since no fitting has been
        done, only the uploaded data appears on the left. Once the "Run fit"
        button is pressed, the live simulation will start.
      </Text>
      <img
        src={IMG_FIT_GRAPHS}
        alt="The graphs of the fitting modal"
      />
      <Text>
        Depending on the task, it may take a while to finish. However, you can
        see the fitting process in real time, as the model's simulation changes
        with each evaluation. The residual norm graph also shows how well the
        fitting is performing and whether it is converging. Once the fitting is
        done, you can see the fitted values in the parameters section, where you
        chose them. At the top of the modal, you can find an "Apply fitted
        parameters" button to apply the parameters to the model on the page
        under the modal. Then use the sliders to adjust your newly fitted model
        and see how it performs.
      </Text>
      <img
        src={IMG_FIT_DONE}
        alt="The fit of the model"
      />
    </Accordion>
    <Accordion title="Fitting locally">
      <Text>
        In some cases, the online fitting tool may not be sufficient. This can
        be because the model is too complex, the data isn't the right type, or
        the fitting routine isn't suited to the task. In these cases, locally
        fitting the model is the best option. This requires not only programming
        knowledge, but also a good understanding of the model and the data. To
        help with this journey, we provide an example fitting routine using the <a
          target="_blank"
          href="{resolve('/models')}/matuszynska2016">Matuszynska2016</a
        >
        model. The snippets shown here are part of a Jupyter Notebook using Python
        and the MxlPy package. The latter has built-in fitting functions, but because
        we are addressing a more complex problem, we will use a custom-built fitting
        routine. We will use MxlPy only to simulate the model. To ensure the integration
        runs smoothly, we will use the <Code>Assimulo</Code> solver, so make sure
        your MxlPy installation includes it.
      </Text>
      <H3>0. Finding the model</H3>
      <Text>
        First, we need to state what we want to do. To do that, we determine
        what we have; in this example, we have experimental data for NPQ. So we
        first look through GreenSloth to find a model that somehow showcases
        NPQ. Using the tag system, live simulations, and the model information
        tables, we determine that <a
          target="_blank"
          href="{resolve('/models')}/matuszynska2016">Matuszynska2016</a
        > is a good candidate. We tried to fit the model to our data through the online
        tool; however, we quickly realized that the model does not have a true variable
        for NPQ and can only be calculated from the model's fluorescence output. However,
        because our experimental data is measured the same way, we can still use this
        model; we need our own fitting routine. So now, we download the MxlPy version
        of the model and start our fitting journey.
      </Text>
      <H3>1. Preparing for fitting</H3>
      <Text>
        To start, we need to create everything our model needs, including
        recreating our data. Therefore, we need to create a simulation protocol
        and any parsing functions our experimental data needs. In this case, our
        data was extracted through a PAM simulation, so we need to review the
        data's metadata to determine the length of each phase and pulse, and the
        PPFD values used. It's easiest when this protocol is created using a
        function, as seen here:
      </Text>
      <Accordion title="Show PAM protocol code">
        <Pre>
          {pam_protocol_code}
        </Pre>
      </Accordion>
      <Text>
        Additionally, we need to create a function that takes the model's output
        and calculates NPQ from it. The fitting routine will use this function,
        take the model's simulation results, and compare them to the
        experimental data. So it must be written so the routine can easily call
        it, provide the correct model output, and receive the correct values
        back. This is done in the following function:
      </Text>
      <Accordion title="Show NPQ calculation code">
        <Pre>
          {npq_code}
        </Pre>
      </Accordion>
      <Text>
        With this, we can finally look at how different our model is from the
        experimental data. This will also let us check the functions we created
        beforehand to see if they work as intended. We can now run the model
        with the protocol we created and use the function to calculate NPQ. Then
        we can plot the results and compare them to our experimental data.
      </Text>
      <Accordion title="Show Simulation and Plotting code">
        <Pre>
          {first_test}
        </Pre>
      </Accordion>
      <Image src={IMG_LOCALFIT_FIRST} />
      <H3>2. The Fitting Routine</H3>
      <Text>
        We can see that our functions work, but the model is far from our
        experimental data. So now we have to create the actual fitting routine.
        In this example, we will use the <Code>least_squares</Code> function from
        <Code>scipy.optimize</Code>. You can use another, but keep in mind that
        the arguments may differ. In this case, the function needs a residual
        function, a starting guess for the parameters, and parameter bounds. The
        residual function is the difference between the NPQ values from a
        simulation run with a given set of parameters and the experimental data.
        So we need to write this function to take a new set of parameters,
        insert them into our model, run the simulation, calculate NPQ, and
        return the difference from the experimental data. Note what your fitting
        routine gives to the residual function. Here, it returns a list of
        parameter values to be fitted, in the order given in the starting guess.
        So we need to make sure we insert the right values in the right order
        into our model. This is done in the following function:
      </Text>
      <Accordion title="Show Residuals Function code">
        <Pre>
          {residual_func}
        </Pre>
      </Accordion>
      <Text>
        Now we can start thinking about which parameters we want to fit. This
        takes practice and a lot of trial and error. It helps to look at the
        output we wish to fit and which parameters affect it directly, then go
        from there. Some parameters, however, should definitely not be fitted.
        For example, physical constants, parameters we know won't change, or
        parameters set by the simulation protocol. To make the trial-and-error
        part of the fitting easier and more efficient, it is recommended to
        create a collection of the parameters you wish to change. With MxlPy,
        it's easy to change several parameters at once using dictionaries. So we
        will set it up using that same format.
      </Text>
      <Text>
        Additionally, we can supply custom starting guesses; however, you
        usually use the ones already in the model. Also set the bounds to a
        reasonable range, with some already having physical constraints that
        should be respected. The following code shows an example of how to set
        up the parameters to be fitted:
      </Text>
      <Accordion title="Show Fitting parameters code">
        <Pre>
          {fit_params}
        </Pre>
      </Accordion>
      <Text>
        We can now run the fitting routine. We will use the <Code
          >least_squares</Code
        > function from <Code>scipy.optimize</Code>. The arguments are the
        residual function, the starting guess, and the bounds. The fitting
        routine returns a set of parameters that best fit the experimental data.
        We can then use these parameters to rerun the model and assess how well
        it fits the data. The following code shows how to run the fitting
        routine:
      </Text>
      <Accordion title="Show Fitting Routine code">
        <Pre>
          {fitting_code}
        </Pre>
      </Accordion>
      <Accordion title="Show Fitting Results code">
        <Pre>
          {fit_plot_code}
        </Pre>
      </Accordion>
      <Image src={IMG_LOCALFIT_RESULT} />
      <H3>3. Are we done?</H3>
      <Text>
        Now we assess whether the fitting was successful. The fitted parameters
        are clearly better than the initial ones; however, they are still not
        perfect. The fitting definitely has problems with the relaxation phase
        of the PAM protocol. This is where the trial-and-error part of fitting
        comes in. We can now change the parameters we want to fit, the starting
        guesses, or the bounds. We can also change the fitting routine itself,
        or even use a different one. The possibilities are endless, and it is up
        to you to find the best combination of parameters and fitting routine to
        fit your data best. Keep in mind that not every model fits every data
        set, and sometimes it is better to use a different model or even create
        your own. Fitting is an art, and it takes practice to get good at it.
        Don't be discouraged if you don't get the perfect fit on the first try.
        Keep trying, and you will get there.
      </Text>
    </Accordion>
  </Section>
{:else if section === "contribute"}
  <Section
    variant="light"
    width="narrow"
  >
    <H1>Two ways to contribute</H1>
    <Ol>
      <Li>
        <Bold>From the browser, no setup.</Bold> Use the
        <button
          type="button"
          class="link-button"
          onclick={() => setSection("submit")}>in-app builder</button
        >: paste your model, confirm it simulates in the live preview, fill in
        the metadata, and open a pre-filled issue. A workflow validates it and
        opens the pull request for you.
      </Li>
      <Li>
        <Bold>As a pull request yourself.</Bold> Clone the repo, drop a
        <Code>src/lib/models/&lt;slug&gt;/</Code> folder (below), run the checks,
        and open a PR. A more comprehensive guide can be found in <Link
          href="{repo}/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</Link
        >
      </Li>
    </Ol>
    <H1>How a model looks like</H1>
    <Text>
      Models are auto-discovered directories under <Code
        >src/lib/models/&lt;slug&gt;/</Code
      >. The <Bold>required</Bold> files are the <Code>meta.ts</Code> and a model
      file in any supported format:
    </Text>
    <Ol>
      <Li><Code>model.mxl.json</Code> (preferred)</Li>
      <Li><Code>model.sbml</Code></Li>
      <Li><Code>model.ts</Code></Li>
    </Ol>
    <Pre>{folder}</Pre>
    <Text>
      The <Code>&lt;slug&gt;</Code>, which is the directory name will be the
      name of the model on the website, and must match the <Code>slug</Code> field
      in <Code>meta.ts</Code>.
    </Text>
    <H2>1. The model file</H2>
    <Text>
      The model file itself is data. It is recommended to let a tool write the
      model file for you:
    </Text>
    <Ol>
      <Li
        ><a
          href="https://github.com/Computational-Biology-Aachen/mxlpy"
          target="_blank"
          rel="noopener noreferrer"><Code>MxlPy</Code></a
        >: A python package for working with ODE models, that has the canonical <Code
          >.mxl.json</Code
        > export.</Li
      >
      <Li
        ><Bold>SBML</Bold>: Use a tool that exports an <Code>sbml</Code> file and
        drop it in the folder and greensloth converts it on load with <Code
          >sbmlToModel</Code
        >.</Li
      >
      <Li
        >Handwriting a <Code>model.ts</Code> file to correspond to your model. (Very
        tedious)</Li
      >
    </Ol>
    <H2>2. The <Code>meta.ts</Code> file</H2>
    <Text>
      The <Code>meta.ts</Code> file contains the metadata of the model, such as the
      title, DOI, tags, and dashboard analyses. It is required for the model to be
      correctly displayed on the website.
    </Text>
    <Pre>{metaTs}</Pre>
    <Accordion title="Each field explained">
      <Text>
        The <Code>meta.ts</Code> file is a TypeScript file that exports a <Code
          >meta</Code
        > object of type <Code>ModelMeta</Code>. The <Code>ModelMeta</Code> type is
        defined in <Code>$lib/types</Code>. The <Code>meta</Code> object contains
        the following fields:
      </Text>
      <Ol>
        <Li
          ><Bold>slug</Bold>: The slug of the model, which is the directory
          name.</Li
        >
        <Li
          ><Bold>title</Bold>: The title of the model, often the first Author's
          surname and the year of publication.</Li
        >
        <Li><Bold>DOI</Bold>: The DOI of the model.</Li>
        <Li><Bold>journal</Bold>: The journal of the model.</Li>
        <Li
          ><Bold>license</Bold>: If the publication is open access, this field
          should be filled with the license information. If non-open access, but
          a scheme is recreated, 'Recreated' should be added</Li
        >
        <Li
          ><Bold>tags</Bold>: The tags of the model. The <Code>Object</Code> should
          include all available tag categories, if the model does not have a tag of
          that category, the array should be empty. The avaiable Tags can be found
          in the
          <a
            href="{repo}/blob/main/src/lib/tags.ts"
            target="_blank"
            rel="noopener noreferrer"><Code>tags.ts</Code></a
          > file.</Li
        >
        <Li><Bold>analyses</Bold>: The analyses of the model.</Li>
        <Li><Bold>contributors</Bold>: The contributors of the model.</Li>
      </Ol>
    </Accordion>
    <H2>3. The model depiction</H2>
    <Text>
      The model depiction is done in two ways. One is a brief description of the
      model, as shown in the publication. It should include the model's purpose,
      the model's structure, and the model's assumptions. This is done in the <Code
        >model.md</Code
      > file.
    </Text>
    <Text>
      The other is a reaction scheme diagram, which is a visual representation
      of the model's reactions. It should include all reactions, all species,
      and all compartments. The reaction scheme diagram should be in SVG format
      and should be named <Code>scheme.svg</Code>. Depending on the license of
      the publication, the scheme can be directly taken from there, or it can
      bre loosely recreated. If the scheme is recreated, it should be mentioned
      in the <Code>license</Code> field of the <Code>meta.ts</Code> file. This step
      is optional, but highly recommended, as it helps to understand the model better.
    </Text>
    <H2>4. The model validation</H2>
    <Text>
      The model reimplementation should be validated by recreating the original
      publication's figures. The validation figures should be placed in the <Code
        >figs/</Code
      > directory, and the script to generate them should be included by calling it
      <Code>validation.*ipynb</Code>. It does not have to be written in Python,
      but a Jupyter Notebook is definitely recommended. If there are errors in
      the validation, but the it is still considered a good addition to the
      GreenSloth website, a <Code>curatornotes.md</Code> file should be added to explain
      the errors and the reasoning behind it.
    </Text>
    <H2>5. Verify and open a PR</H2>
    <Pre>{verifyCode}</Pre>
    <Text>
      Then open a pull request against <Link href={repo}>green-sloth</Link>. CI
      re-runs <Code>validate:models</Code> and a build on every PR.
    </Text>
  </Section>
{:else if section === "submit"}
  <Contribute />
{/if}

<style>
  :global(H1) {
    width: 100%;
  }

  .link-button {
    display: inline;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    color: var(--color-primary, blue); /* Use your theme's link color */
    font: inherit;
  }
  .link-button:hover {
    text-decoration: underline;
  }
  :global(button.inverted) {
    border: 0.2em solid var(--color-primary);
  }
  :global(button.active-tab) {
    border-bottom: 0.2em solid var(--color-accent) !important;
  }
</style>
