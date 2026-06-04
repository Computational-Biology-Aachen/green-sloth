<script lang="ts">
  import cpblLogo from "$lib/assets/cpbl-logo.svg";
  import elouen from "$lib/assets/elouen.jpeg";
  import {
    H1,
    ImageRound,
    Section,
    SectionHeader,
    Text,
  } from "@computational-biology-aachen/design";
</script>

<svelte:head>
  <title>About - GreenSloth</title>
</svelte:head>

<SectionHeader>
  <div class="header-row">
    <H1 color="light">About Us</H1>
    <a
      href="https://www.cpbl.rwth-aachen.de/go/id/sazuq/?lidx=1"
      target="_blank"
    >
      <img
        src={cpblLogo}
        alt="RWTH Computational Life Science"
        class="rwth-logo"
      />
    </a>
  </div>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <div class="about-grid">
    <div class="about-text">
      <Text>
        The idea of GreenSloth has been a dream of the Computational Life
        Science Group, led by Prof. Dr. rer. nat. Matuszyńska, at the RWTH
        Aachen. We believe in making all our models ready for use and strive to
        make them as accessible as possible. To this end, we dedicate entire
        projects to bringing our field closer to our esteemed scientific
        colleagues, which is why GreenSloth holds significant importance for us.
      </Text>
      <Text>
        To initiate this project, we have assigned Elouen Corvest (<a
          href="mailto:elouen.corvest@rwth-aachen.de"
          >elouen.corvest@rwth-aachen.de</a
        >) to develop the concept of GreenSloth, as he has gained extensive
        experience with photosynthesis models during his time in our Group. We
        are also proud of his work on ComPhot, our teaching tool on
        computational photosynthesis (<a
          href="https://doi.org/10.1093/plcell/koae101"
          target="_blank">https://doi.org/10.1093/plcell/koae101</a
        >), which he also represented us at the Second European Congress on
        Photosynthesis (EPS2) and even won a poster award.
      </Text>
      <Text>
        Therefore, we are confident in his experience and tenacity in creating
        GreenSloth to meet the expectations of the scientific community. Once
        his Master's Thesis duties have been completed in this project, we, the
        Group, will take the reins on the maintenance and improvement of
        GreenSloth while staying true to the core that Elouen has built.
      </Text>
      <Text>
        We are very enthusiastic about this project and what it represents. If
        you have any ideas, or even models you wish to be represented here,
        please write us an email (<a href="mailto:elouen.corvest@rwth-aachen.de"
          >elouen.corvest@rwth-aachen.de</a
        >).
      </Text>
    </div>
    <div class="about-photo">
      <ImageRound
        path={elouen}
        alt="Elouen Corvest"
        objectFit="cover"
        objectPosition="top"
      />
    </div>
  </div>
</Section>

<style>
  .header-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-6);
  }

  .rwth-logo {
    filter: brightness(0) invert(1);
    height: 3rem;
  }

  .about-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    align-items: start;
    gap: var(--space-8);
  }

  @media (max-width: 768px) {
    .about-grid {
      grid-template-columns: 1fr;
    }

    .about-photo {
      justify-self: center;
      max-width: 10rem;
    }
  }

  .about-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
</style>
