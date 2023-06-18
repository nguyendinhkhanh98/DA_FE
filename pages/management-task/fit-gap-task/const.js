const SK = "sk";
const BSK = "bsk";

export const columns = [
  {
    slots: { title: "user" },
    dataIndex: "user",
    key: "user",
    scopedSlots: { customRender: "user" }
  }
];

// Fit skill
export const isFitTaskSkill = (userAssessment, taskSkill) => {
  for (let index = 0; index < taskSkill.length; index++) {
    const skill = taskSkill[index];
    const userSkill = userAssessment.find(item => item.skill_id == skill.id);
    if (!userSkill || userSkill.level < skill.level) return false;
  }

  return true;
};

export const getListFitSkillTask = (latestSkillApproved, skillRequired) => {
  return latestSkillApproved
    .map(user => {
      if (isFitTaskSkill(user.skills, skillRequired))
        return {
          ...user,
          skills: user.skills.map(item => {
            return { ...item, type: skillRequired.find(skill => skill.id == item.skill_id)?.isBusSkill ? BSK : SK };
          })
        };
    })
    .filter(Boolean);
};

export const mergeUserSkillTask = (listUserEngineerSkill, listUserBusinessSkill) => {
  if (listUserBusinessSkill.length) {
    if (!listUserEngineerSkill.length) return listUserBusinessSkill;
    listUserEngineerSkill.forEach(eSkill => {
      let bSkillOfUser = listUserBusinessSkill.find(item => item.user_id == eSkill.user_id);
      if (bSkillOfUser && bSkillOfUser.skills && bSkillOfUser.skills.length) {
        bSkillOfUser.skills.forEach(item => {
          eSkill.skills.push({ ...item, isBussKill: true });
        });
      }
    });
  }
  return listUserEngineerSkill;
};

// Gap skill
export const isGapTaskSkill = (userAssessment, taskSkillRequired) => {
  for (let index = 0; index < taskSkillRequired.length; index++) {
    const skillRequired = taskSkillRequired[index];
    const userSkill = userAssessment.find(item => item.skill_id == skillRequired.id);
    if (!userSkill || userSkill.level == 0)
      if (skillRequired.level >= 2)
        // +-1 level
        return false;
    // +-1 level
    if (userSkill && userSkill.level <= skillRequired.level - 2) return false;
  }

  return true;
};

export const getListGapSkillTask = (latestSkillApproved, skillRequired) => {
  return latestSkillApproved
    .map(user => {
      if (isGapTaskSkill(user.skills, skillRequired))
        return {
          ...user,
          skills: user.skills.map(item => {
            return { ...item, type: skillRequired.find(skill => skill.id == item.skill_id)?.isBusSkill ? BSK : SK };
          })
        };
    })
    .filter(Boolean);
};

export const filterUserGapAndNotFit = (extractedUserGapSkill, listFitEngineerSkill) => {
  const fitUserId = listFitEngineerSkill.map(item => item.user_id);
  return extractedUserGapSkill.filter(item => !fitUserId.includes(item.user_id));
};
